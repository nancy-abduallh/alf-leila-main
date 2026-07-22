import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from "react-router";
import { useLanguage } from "../providers/language";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">{t("notFound.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t("notFound.message")}</p>
          <Button asChild className="w-full">
            <Link to="/">{t("notFound.backToHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}