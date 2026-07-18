import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  Utensils,
  Plus,
  Pencil,
  Trash2,
  Eye,
  DollarSign,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DishFormDialog, type DishFormValues } from "@/components/admin/DishFormDialog";
import type { Dish } from "@db/schema";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ADMIN_LOGIN_PATH } from "@/const";

const reservationStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  paid: "bg-blue-500/10 text-blue-400",
  preparing: "bg-orange-500/10 text-orange-400",
  delivered: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-red-500/10 text-red-400",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-4">
      <Icon className="w-5 h-5 text-gold-primary mb-2" />
      <p className="font-display text-cream text-xl">{value}</p>
      <p className="text-cream/40 text-xs">{label}</p>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(ADMIN_LOGIN_PATH);
    } else if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.analytics.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: reservations, isLoading: reservationsLoading } = trpc.reservation.list.useQuery(
    undefined,
    { enabled: isAdmin },
  );

  const updateReservationStatus = trpc.reservation.updateStatus.useMutation({
    onSuccess: () => utils.reservation.list.invalidate(),
  });

  const { data: orders, isLoading: ordersLoading } = trpc.order.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const updateOrderStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      toast.success("Order status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: allDishes, isLoading: dishesLoading } = trpc.dish.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const createDish = trpc.dish.create.useMutation({
    onSuccess: () => {
      utils.dish.list.invalidate();
      utils.dish.featured.invalidate();
      setDishDialogOpen(false);
      toast.success("Dish added");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateDish = trpc.dish.update.useMutation({
    onSuccess: () => {
      utils.dish.list.invalidate();
      utils.dish.featured.invalidate();
      setDishDialogOpen(false);
      toast.success("Dish updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteDish = trpc.dish.delete.useMutation({
    onSuccess: () => {
      utils.dish.list.invalidate();
      utils.dish.featured.invalidate();
      toast.success("Dish deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: reviews, isLoading: reviewsLoading } = trpc.review.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  const [dishDialogOpen, setDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  const openAddDish = () => {
    setEditingDish(null);
    setDishDialogOpen(true);
  };

  const openEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishDialogOpen(true);
  };

  const handleDishSubmit = (values: DishFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      category: values.category,
      subcategory:
        values.category === "beverage" && values.subcategory ? values.subcategory : null,
      imageUrl: values.imageUrl || undefined,
      featured: values.featured,
      stock: values.stock === "" ? null : Number(values.stock),
    };

    if (editingDish) {
      updateDish.mutate({ id: editingDish.id, ...payload });
    } else {
      createDish.mutate(payload);
    }
  };

  if (authLoading) {
    return (
      <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAdmin) return null;

  const pendingCount = reservations?.filter((r) => r.status === "pending").length || 0;
  const confirmedCount = reservations?.filter((r) => r.status === "confirmed").length || 0;

  return (
    <main className="bg-table-dark min-h-screen pt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
        <h1 className="font-display text-cream text-2xl mb-2">Admin Dashboard</h1>
        <p className="text-cream/50 text-sm mb-8">Welcome back, {user?.name}</p>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8">
            {statsLoading || !stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-table-mid rounded-lg h-24" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Eye} label="Total Visits" value={stats.totals.totalVisits} />
                  <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totals.totalOrders} />
                  <StatCard icon={DollarSign} label="Total Revenue" value={`${stats.totals.totalRevenue} EGP`} />
                  <StatCard icon={Calendar} label="Total Reservations" value={stats.totals.totalReservations} />
                </div>

                <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                  <h3 className="text-cream font-display text-lg mb-4">Visitors (Last 14 Days)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.visitsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#8B735530" />
                      <XAxis dataKey="day" stroke="#F5F0E860" fontSize={12} />
                      <YAxis stroke="#F5F0E860" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#14141B", border: "1px solid #8B735530" }} />
                      <Line type="monotone" dataKey="count" stroke="#C9A96E" strokeWidth={2} name="Visits" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                    <h3 className="text-cream font-display text-lg mb-4">Orders</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.ordersByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#8B735530" />
                        <XAxis dataKey="day" stroke="#F5F0E860" fontSize={11} />
                        <YAxis stroke="#F5F0E860" fontSize={11} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#14141B", border: "1px solid #8B735530" }} />
                        <Legend />
                        <Bar dataKey="count" fill="#C9A96E" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                    <h3 className="text-cream font-display text-lg mb-4">Reservations</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.reservationsByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#8B735530" />
                        <XAxis dataKey="day" stroke="#F5F0E860" fontSize={11} />
                        <YAxis stroke="#F5F0E860" fontSize={11} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#14141B", border: "1px solid #8B735530" }} />
                        <Bar dataKey="count" fill="#8B7355" name="Reservations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Reservations */}
          <TabsContent value="reservations">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Calendar} label="Total Reservations" value={reservations?.length || 0} />
              <StatCard icon={Clock} label="Pending" value={pendingCount} />
              <StatCard icon={CheckCircle} label="Confirmed" value={confirmedCount} />
              <StatCard
                icon={Users}
                label="Total Guests"
                value={reservations?.reduce((sum, r) => sum + r.guests, 0) || 0}
              />
            </div>

            <div className="bg-table-mid border border-gold-primary/10 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gold-primary/10 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-primary" />
                <h2 className="font-display text-cream text-lg">Reservations</h2>
              </div>

              {reservationsLoading ? (
                <div className="p-8 text-center text-cream/40">Loading...</div>
              ) : reservations && reservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gold-primary/10">
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Date</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Time</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Guests</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res) => (
                        <tr key={res.id} className="border-b border-gold-primary/5 hover:bg-gold-primary/5 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-cream text-sm">{res.name}</p>
                            <p className="text-cream/40 text-xs">{res.email}</p>
                          </td>
                          <td className="px-4 py-3 text-cream/70 text-sm">
                            {new Date(res.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-cream/70 text-sm">{res.time}</td>
                          <td className="px-4 py-3 text-cream/70 text-sm">{res.guests}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${reservationStatusColors[res.status]}`}>
                              {res.status === "confirmed" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : res.status === "cancelled" ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {res.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {res.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateReservationStatus.mutate({ id: res.id, status: "confirmed" })}
                                    className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs rounded hover:bg-green-500/20 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => updateReservationStatus.mutate({ id: res.id, status: "cancelled" })}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-cream/40">No reservations yet.</div>
              )}
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <div className="bg-table-mid border border-gold-primary/10 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gold-primary/10 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gold-primary" />
                <h2 className="font-display text-cream text-lg">Orders</h2>
              </div>

              {ordersLoading ? (
                <div className="p-8 text-center text-cream/40">Loading...</div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gold-primary/10">
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Order</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Customer</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Items</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Address</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Total</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gold-primary/5 hover:bg-gold-primary/5 transition-colors align-top">
                          <td className="px-4 py-3">
                            <p className="text-cream text-sm">#{order.id}</p>
                            <p className="text-cream/40 text-xs">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-cream text-sm">{order.customerName || "—"}</p>
                            <p className="text-cream/40 text-xs">{order.customerEmail}</p>
                            <p className="text-cream/40 text-xs">{order.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-cream/70 text-xs space-y-0.5">
                            {order.items.map((item) => (
                              <p key={item.id}>
                                {item.quantity}x {item.dishName}
                              </p>
                            ))}
                          </td>
                          <td className="px-4 py-3 text-cream/60 text-xs max-w-[160px]">
                            {order.address}, {order.city}
                          </td>
                          <td className="px-4 py-3 text-gold-primary text-sm">{order.totalAmount} EGP</td>
                          <td className="px-4 py-3">
                            <Select
                              value={order.status}
                              onValueChange={(status) =>
                                updateOrderStatus.mutate({
                                  id: order.id,
                                  status: status as typeof order.status,
                                })
                              }
                            >
                              <SelectTrigger className={`w-36 text-xs ${orderStatusColors[order.status]}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-cream/40">No orders yet.</div>
              )}
            </div>
          </TabsContent>

          {/* Menu Management */}
          <TabsContent value="menu">
            <div className="bg-table-mid border border-gold-primary/10 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gold-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-gold-primary" />
                  <h2 className="font-display text-cream text-lg">Menu Items</h2>
                </div>
                <Button size="sm" onClick={openAddDish}>
                  <Plus className="w-4 h-4" />
                  Add Dish
                </Button>
              </div>

              {dishesLoading ? (
                <div className="p-8 text-center text-cream/40">Loading...</div>
              ) : allDishes && allDishes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gold-primary/10">
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Type</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Price</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Stock</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Featured</th>
                        <th className="text-left px-4 py-3 text-cream/50 text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDishes.map((dish) => (
                        <tr key={dish.id} className="border-b border-gold-primary/5 hover:bg-gold-primary/5 transition-colors">
                          <td className="px-4 py-3 text-cream text-sm">{dish.name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 text-xs capitalize bg-gold-primary/10 text-gold-primary rounded-full">
                              {dish.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {dish.category === "beverage" && dish.subcategory ? (
                              <span className="px-2.5 py-1 text-xs capitalize bg-cream/10 text-cream/70 rounded-full">
                                {dish.subcategory}
                              </span>
                            ) : (
                              <span className="text-cream/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gold-primary text-sm">{dish.price} EGP</td>
                          <td className="px-4 py-3 text-sm">
                            {dish.stock === null ? (
                              <span className="text-cream/30">Unlimited</span>
                            ) : dish.stock <= 0 ? (
                              <span className="text-red-400">Out of stock</span>
                            ) : (
                              <span className="text-cream/70">{dish.stock}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {dish.featured ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className="text-cream/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditDish(dish)}
                                className="p-1.5 text-cream/60 hover:text-gold-primary hover:bg-gold-primary/10 rounded transition-colors"
                                aria-label={`Edit ${dish.name}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(dish)}
                                className="p-1.5 text-cream/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                aria-label={`Delete ${dish.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-cream/40">
                  No menu items yet. Click &quot;Add Dish&quot; to create one.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <div className="bg-table-mid border border-gold-primary/10 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gold-primary/10 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-primary" />
                <h2 className="font-display text-cream text-lg">Customer Reviews</h2>
              </div>

              {reviewsLoading ? (
                <div className="p-8 text-center text-cream/40">Loading...</div>
              ) : reviews && reviews.length > 0 ? (
                <div className="divide-y divide-gold-primary/5">
                  {reviews.map((review) => (
                    <div key={review.id} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-cream text-sm">{review.userName || "Guest"}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={14}
                              className={n <= review.rating ? "fill-gold-primary text-gold-primary" : "text-cream/20"}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-cream/60 text-sm">{review.comment}</p>}
                      <p className="text-cream/30 text-xs mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-cream/40">No reviews yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DishFormDialog
        open={dishDialogOpen}
        onOpenChange={setDishDialogOpen}
        dish={editingDish}
        onSubmit={handleDishSubmit}
        isSubmitting={createDish.isPending || updateDish.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this dish from the menu. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteDish.mutate({ id: deleteTarget.id })}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}