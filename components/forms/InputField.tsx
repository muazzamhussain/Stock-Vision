import React, { useState } from 'react'
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({ name, label, placeholder, type = "text", register, error, validation, disabled, value, showPasswordToggle = false }: FormInputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const canTogglePassword = type === "password" && showPasswordToggle;
    const inputType = canTogglePassword && isPasswordVisible ? "text" : type;

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>
            <div className="relative">
                <Input
                    type={inputType}
                    id={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={value}
                    className={cn('form-input', {
                        'opacity-50 cursor-not-allowed': disabled,
                        'pr-12': canTogglePassword,
                    })}
                    {...register(name, validation)}
                />
                {canTogglePassword && (
                    <button
                        type="button"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        aria-pressed={isPasswordVisible}
                        disabled={disabled}
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPasswordVisible ? (
                            <EyeOff aria-hidden="true" size={18} />
                        ) : (
                            <Eye aria-hidden="true" size={18} />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    )
}
export default InputField
