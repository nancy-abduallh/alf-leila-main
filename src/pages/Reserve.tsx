import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "../providers/trpc";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../providers/language";
import { Calendar, Clock, Users, Phone, MessageSquare, CheckCircle } from "lucide-react";

export default function Reserve() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    phone: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createReservation = trpc.reservation.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) return;
    createReservation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (authLoading) {
    return (
      <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-cream text-2xl mb-3">{t("reservePage.signInTitle")}</h1>
          <p className="text-cream/50 text-sm mb-6">
            {t("reservePage.signInDesc")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-gold-primary text-table-dark text-sm font-medium rounded-full hover:bg-cream transition-colors"
            >
              {t("reservePage.signIn")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 border border-gold-primary text-gold-primary text-sm font-medium rounded-full hover:bg-gold-primary hover:text-table-dark transition-colors"
            >
              {t("reservePage.createAccount")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-table-dark min-h-screen pt-[72px]">
      <div className="relative h-[35vh] min-h-[250px] overflow-hidden">
        <img
          src="/restaurant-atmosphere.jpg"
          alt="Restaurant atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/50 to-[#0A0A0F]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p
            className="font-heading text-gold-primary text-sm tracking-[0.2em] mb-3"
            style={{ fontStyle: "italic" }}
          >
            {t("reservePage.eyebrow")}
          </p>
          <h1 className="font-display text-cream text-[clamp(2rem,4vw,3.5rem)]">
            {t("reservePage.title")}
          </h1>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {submitted ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-gold-primary mx-auto mb-6" />
            <h2 className="font-display text-cream text-2xl mb-3">{t("reservePage.confirmedTitle")}</h2>
            <p className="text-cream/60 text-base mb-2">
              {t("reservePage.confirmedMessage").replace("{name}", user.name || "")}
            </p>
            <p className="text-cream/40 text-sm">
              {t("reservePage.confirmedEmail").replace("{email}", user.email)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-cream/70 text-sm mb-2">
                  <Phone className="w-4 h-4 text-gold-primary" />
                  {t("reservePage.phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
                  placeholder={t("reservePage.phonePlaceholder")}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-cream/70 text-sm mb-2">
                  <Users className="w-4 h-4 text-gold-primary" />
                  {t("reservePage.guestsLabel")}
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm focus:outline-none focus:border-gold-primary transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n} className="bg-table-mid">
                      {n} {n === 1 ? t("reservePage.guest") : t("reservePage.guests")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-cream/70 text-sm mb-2">
                  <Calendar className="w-4 h-4 text-gold-primary" />
                  {t("reservePage.dateLabel")}
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm focus:outline-none focus:border-gold-primary transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-cream/70 text-sm mb-2">
                  <Clock className="w-4 h-4 text-gold-primary" />
                  {t("reservePage.timeLabel")}
                </label>
                <select
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm focus:outline-none focus:border-gold-primary transition-colors"
                >
                  <option value="" className="bg-table-mid">
                    {t("reservePage.selectTime")}
                  </option>
                  {[
                    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
                  ].map((time) => (
                    <option key={time} value={time} className="bg-table-mid">
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-cream/70 text-sm mb-2">
                <MessageSquare className="w-4 h-4 text-gold-primary" />
                {t("reservePage.notesLabel")}
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors resize-none"
                placeholder={t("reservePage.notesPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={createReservation.isPending}
              className="w-full py-4 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createReservation.isPending ? t("reservePage.submitting") : t("reservePage.confirm")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}