import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: "Address",
      value: "12 Talaat Harb St, Downtown Cairo, Egypt",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+20 2 2574 8932",
    },
    {
      icon: Mail,
      label: "Email",
      value: "hello@alfleila.com",
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Sun–Thu: 12PM–11PM | Fri–Sat: 1PM–12AM",
    },
  ];

  return (
    <main className="bg-table-dark min-h-screen pt-[72px]">
      {/* Hero */}
      <div className="relative h-[30vh] min-h-[200px] overflow-hidden">
        <img
          src="/restaurant-interior.jpg"
          alt="Restaurant"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/50 to-[#0A0A0F]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="font-heading text-gold-primary text-sm tracking-[0.2em] mb-3" style={{ fontStyle: "italic" }}>
            GET IN TOUCH
          </p>
          <h1 className="font-display text-cream text-[clamp(2rem,4vw,3.5rem)]">
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-cream text-2xl mb-6">
              We&apos;d Love to Hear From You
            </h2>
            <p className="text-cream/60 text-sm leading-relaxed mb-8">
              Whether you have a question about our menu, want to book a private event, 
              or simply want to say hello, our team is here to help.
            </p>

            <div className="space-y-5 mb-10">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-cream/40 text-xs tracking-[0.05em] uppercase mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-cream/80 text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-cream/40 text-xs tracking-[0.05em] uppercase mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-10 h-10 rounded-full border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-table-dark transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-10 h-10 rounded-full border border-gold-primary/30 flex items-center justify-center text-gold-primary hover:bg-gold-primary hover:text-table-dark transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-6 lg:p-8">
            {sent ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gold-primary mx-auto mb-4" />
                <h3 className="font-display text-cream text-xl mb-2">Message Sent</h3>
                <p className="text-cream/50 text-sm">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-cream/60 text-sm mb-1.5 block">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/15 rounded-lg text-cream text-sm placeholder:text-cream/25 focus:outline-none focus:border-gold-primary transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-cream/60 text-sm mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/15 rounded-lg text-cream text-sm placeholder:text-cream/25 focus:outline-none focus:border-gold-primary transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-cream/60 text-sm mb-1.5 block">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/15 rounded-lg text-cream text-sm placeholder:text-cream/25 focus:outline-none focus:border-gold-primary transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="text-cream/60 text-sm mb-1.5 block">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/15 rounded-lg text-cream text-sm placeholder:text-cream/25 focus:outline-none focus:border-gold-primary transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
