import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";
import { toast } from "sonner";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
                    className={n <= rating ? "fill-gold-primary text-gold-primary" : "text-cream/20"}
                />
            ))}
        </div>
    );
}

export default function ReviewsSection() {
    const { user } = useAuth();
    const customer = user && user.role !== "admin" ? user : null;

    const utils = trpc.useUtils();
    const { data: reviews, isLoading } = trpc.review.list.useQuery();
    const { data: myReview } = trpc.review.myReview.useQuery(undefined, {
        enabled: !!customer,
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const submitReview = trpc.review.submit.useMutation({
        onSuccess: () => {
            utils.review.list.invalidate();
            utils.review.myReview.invalidate();
            toast.success("Thank you for your review!");
            setComment("");
        },
        onError: (err) => toast.error(err.message),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitReview.mutate({ rating, comment: comment || undefined });
    };

    return (
        <section className="bg-table-dark py-24 lg:py-32">
            <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
                <div className="text-center mb-16">
                    <p className="font-heading text-gold-primary text-sm tracking-[0.15em] mb-3" style={{ fontStyle: "italic" }}>
                        TESTIMONIALS
                    </p>
                    <h2 className="font-display text-cream text-[clamp(1.8rem,3vw,2.8rem)]">
                        What Our Guests Say
                    </h2>
                    <div className="w-16 h-[1px] bg-gold-primary mx-auto mt-4" />
                </div>

                {customer && (
                    <form onSubmit={handleSubmit} className="bg-table-mid border border-gold-primary/10 rounded-lg p-6 mb-12 max-w-xl mx-auto">
                        <p className="text-cream text-sm mb-3">{myReview ? "Update your review" : "Leave a review"}</p>
                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                                    <Star
                                        size={24}
                                        className={n <= rating ? "fill-gold-primary text-gold-primary" : "text-cream/20"}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="Share your experience..."
                            className="w-full px-4 py-3 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors resize-none mb-3"
                        />
                        <button
                            type="submit"
                            disabled={submitReview.isPending}
                            className="px-6 py-2.5 bg-gold-primary text-table-dark text-sm font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
                        >
                            {submitReview.isPending ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
                        </button>
                    </form>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-table-mid rounded-lg h-32" />
                        ))}
                    </div>
                ) : reviews && reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-table-mid border border-gold-primary/10 rounded-lg p-6">
                                <Stars rating={review.rating} />
                                {review.comment && <p className="text-cream/70 text-sm mt-3 leading-relaxed">{review.comment}</p>}
                                <p className="text-cream/40 text-xs mt-4">
                                    {review.userName || "Guest"} · {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-cream/40 text-center">No reviews yet — be the first to share your experience.</p>
                )}
            </div>
        </section>
    );
}