import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, logout, isLoggingIn, loginError, refresh } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accessError, setAccessError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccessError(null);
        try {
            await login(email, password);
            const { data: freshUser } = await refresh();

            if (freshUser?.role === "admin") {
                navigate("/admin");
            } else {
                setAccessError("This account does not have admin access.");
                logout();
            }
        } catch {
            // surfaced via loginError
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-table-dark">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <ShieldCheck className="w-8 h-8 text-gold-primary" />
                    </div>
                    <CardTitle>Admin Sign In</CardTitle>
                    <CardDescription>Sign in to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email">Email</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-password">Password</Label>
                            <Input
                                id="admin-password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        {(loginError || accessError) && (
                            <p className="text-destructive text-sm">
                                {accessError || loginError?.message}
                            </p>
                        )}
                        <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
                            {isLoggingIn ? "Signing in..." : "Sign in to Dashboard"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}