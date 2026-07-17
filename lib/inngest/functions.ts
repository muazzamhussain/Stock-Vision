import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";
import {
  getUntriggeredAlerts,
  markAlertTriggered,
} from "@/lib/actions/alert.actions";
import { getEmailPreferencesByUserId } from "@/lib/actions/emailPreferences.actions";
import { sendAlertEmail } from "@/lib/nodemailer";
import { saveSentimentResult } from "@/lib/actions/sentiment.actions";
import { SENTIMENT_ANALYSIS_PROMPT } from "@/lib/inngest/prompts";
import { getOrCreateEmailPreferences } from "@/lib/actions/emailPreferences.actions";

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    triggers: [{ event: "app/user.created" }],
  },
  async ({ event, step }) => {
    const data = event.data as {
      userId: string;
      email: string;
      name: string;
      country: string;
      investmentGoals: string;
      riskTolerance: string;
      preferredIndustry: string;
    };

    const userProfile = `
- Country: ${data.country}
- Investment goals: ${data.investmentGoals}
- Risk tolerance: ${data.riskTolerance}
- Preferred industry: ${data.preferredIndustry}
`;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    const introText =
      (part && "text" in part ? part.text : null) ??
      "Thanks for joining Stock Vision. You now have the tools to track markets and make smarter moves.";

    const prefs = await step.run(
      "create-email-preferences",
      async () => {
        return await getOrCreateEmailPreferences(
          data.userId,
          data.email
        );
      }
    );

    await step.run("send-welcome-email", async () => {
      return await sendWelcomeEmail({
        email: data.email,
        name: data.name,
        intro: introText,
        unsubscribeToken: prefs?.unsubscribeToken,
      });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    triggers: [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  },
  async ({ step }) => {
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };

    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{ user: User; articles: MarketNewsArticle[] }> = [];

      for (const user of users as User[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          articles = (articles || []).slice(0, 6);

          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }

          perUser.push({ user, articles });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }

      return perUser;
    });

    const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2),
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("Failed to summarize news for:", user.email, e);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    await step.run("send-news-emails", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          // Get the user's email preferences
          const prefs = await getOrCreateEmailPreferences(user.id, user.email);
          if (!prefs || !prefs.isSubscribed) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
            unsubscribeToken: prefs.unsubscribeToken,
          });
        }),
      );
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  },
);

export const checkPriceAlerts = inngest.createFunction(
  {
    id: "check-price-alerts",
    triggers: [
      { cron: "*/15 * * * *" }, // Every 15 minutes
    ],
  },
  async ({ step }) => {
    const alerts = await step.run(
      "fetch-untriggered-alerts",
      getUntriggeredAlerts,
    );

    if (!alerts || alerts.length === 0) {
      return { success: true, message: "No pending alerts to check." };
    }

    const quoteResults = await step.run("fetch-quotes", async () => {
      const results: Array<{ alert: any; currentPrice: number }> = [];

      for (const alert of alerts) {
        try {
          const token =
            process.env.FINNHUB_API_KEY ??
            process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
          const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(alert.symbol)}&token=${token}`;
          const response = await fetch(url, { cache: "no-store" });
          const data = await response.json();

          if (data.c) {
            results.push({ alert, currentPrice: data.c });
          }
        } catch (e) {
          console.error(`Failed to fetch quote for ${alert.symbol}:`, e);
        }
      }

      return results;
    });

    // Check conditions and send emails
    const triggeredAlerts = quoteResults.filter(({ alert, currentPrice }) => {
      if (alert.condition === "above") {
        return currentPrice >= alert.targetPrice;
      } else {
        return currentPrice <= alert.targetPrice;
      }
    });

    await step.run("send-alert-emails", async () => {
      for (const { alert, currentPrice } of triggeredAlerts) {
        try {
          // Get user's email preferences for unsubscribe token
          const prefs = await getEmailPreferencesByUserId(alert.userId);

          if (prefs && prefs.isSubscribed) {
            await sendAlertEmail({
              email: prefs.email,
              symbol: alert.symbol,
              company: alert.company,
              targetPrice: alert.targetPrice,
              condition: alert.condition,
              currentPrice,
              unsubscribeToken: prefs.unsubscribeToken,
            });
          }

          // Mark as triggered regardless of email success
          await markAlertTriggered(alert._id);
        } catch (e) {
          console.error(`Failed to process alert for ${alert.symbol}:`, e);
          // Still mark as triggered to avoid infinite retries
          await markAlertTriggered(alert._id);
        }
      }
    });

    return {
      success: true,
      message: `Processed ${triggeredAlerts.length} triggered alerts.`,
    };
  },
);

export const analyzeSentiment = inngest.createFunction(
  {
    id: "analyze-sentiment",
    triggers: [{ event: "app/sentiment.analyze" }],
  },
  async ({ event, step }) => {
    const { symbol } = event.data as { symbol: string };

    // Fetch news for the symbol
    const news = await step.run("fetch-news", async () => {
      return await getNews([symbol]);
    });

    if (!news || news.length === 0) {
      return {
        success: false,
        message: `No news found for ${symbol}`,
      };
    }

    // Extract headlines for sentiment analysis
    const headlines = news
      .slice(0, 10)
      .map((article) => `- ${article.headline}`)
      .join("\n");

    // Analyze sentiment with Gemini
    const prompt = SENTIMENT_ANALYSIS_PROMPT.replace(
      "{{newsHeadlines}}",
      headlines,
    );

    const response = await step.ai.infer("analyze-sentiment-ai", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
    });

    // Parse the response
    const part = response.candidates?.[0]?.content?.parts?.[0];
    let result;

    try {
      const text = part && "text" in part ? part.text : null;
      if (text) {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = JSON.parse(text);
        }
      } else {
        throw new Error("No text in response");
      }
    } catch (e) {
      console.error("Failed to parse sentiment response:", e);
      // Fallback result
      result = {
        score: 5,
        label: "Neutral",
        summary: "Unable to analyze sentiment due to data limitations.",
        keyFactors: ["Limited data available"],
      };
    }

    // Validate and clean the result
    const validatedResult = {
      score: Math.min(10, Math.max(1, Math.round(result.score || 5))),
      label: ["Bullish", "Bearish", "Neutral"].includes(result.label)
        ? result.label
        : "Neutral",
      summary: result.summary || "No summary available.",
      keyFactors: Array.isArray(result.keyFactors)
        ? result.keyFactors.slice(0, 5)
        : ["No key factors available"],
    };

    // Save the result
    await step.run("save-sentiment-result", async () => {
      await saveSentimentResult(
        symbol,
        validatedResult.score,
        validatedResult.label,
        validatedResult.summary,
        validatedResult.keyFactors,
      );
    });

    return {
      success: true,
      symbol,
      sentiment: validatedResult,
    };
  },
);
