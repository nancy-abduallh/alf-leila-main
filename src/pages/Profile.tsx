import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";

export default function Profile() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[600px] mx-auto px-6 py-16">
                <h1 className="font-display text-cream text-2xl mb-8">My Profile</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gold-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="text-sm">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gold-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-gold-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Member since</p>
                                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}