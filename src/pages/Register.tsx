import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../providers/language";

export default function Register() {
    const navigate = useNavigate();
    const { register, isRegistering, registerError } = useAuth();
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate("/");
        } catch {
            // surfaced via registerError
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle>{t("auth.registerTitle")}</CardTitle>
                    <CardDescription>{t("auth.registerDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("auth.name")}</Label>
                            <Input
                                id="name"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("auth.namePlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("auth.email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("auth.emailPlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("auth.password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("auth.passwordHintPlaceholder")}
                            />
                        </div>
                        {registerError && (
                            <p className="text-destructive text-sm">{registerError.message}</p>
                        )}
                        <Button type="submit" className="w-full" size="lg" disabled={isRegistering}>
                            {isRegistering ? t("auth.creatingAccount") : t("auth.createAccount")}
                        </Button>
                    </form>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                        {t("auth.haveAccount")}{" "}
                        <Link to="/login" className="text-primary underline underline-offset-4">
                            {t("auth.signIn")}
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}