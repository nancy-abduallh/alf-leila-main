import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Dish } from "@db/schema";

export type DishFormValues = {
    name: string;
    description: string;
    price: string;
    category: "appetizer" | "main" | "dessert" | "beverage";
    imageUrl: string;
    featured: boolean;
    stock: string; // empty string = unlimited
};

const emptyForm: DishFormValues = {
    name: "",
    description: "",
    price: "",
    category: "main",
    imageUrl: "",
    featured: false,
    stock: "",
};

type DishFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dish?: Dish | null;
    onSubmit: (values: DishFormValues) => void;
    isSubmitting?: boolean;
};

export function DishFormDialog({
    open,
    onOpenChange,
    dish,
    onSubmit,
    isSubmitting,
}: DishFormDialogProps) {
    const [values, setValues] = useState<DishFormValues>(emptyForm);

    useEffect(() => {
        if (open) {
            setValues(
                dish
                    ? {
                        name: dish.name,
                        description: dish.description ?? "",
                        price: dish.price,
                        category: dish.category,
                        imageUrl: dish.imageUrl ?? "",
                        featured: !!dish.featured,
                        stock: dish.stock === null || dish.stock === undefined ? "" : String(dish.stock),
                    }
                    : emptyForm,
            );
        }
    }, [open, dish]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{dish ? "Edit Dish" : "Add Dish"}</DialogTitle>
                    <DialogDescription>
                        {dish ? "Update this menu item's details." : "Add a new item to the menu."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="dish-name">Name</Label>
                        <Input
                            id="dish-name"
                            required
                            maxLength={100}
                            value={values.name}
                            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                            placeholder="Molokhia Royale"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dish-description">Description</Label>
                        <Textarea
                            id="dish-description"
                            rows={3}
                            value={values.description}
                            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                            placeholder="Short description shown on the menu"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dish-price">Price (EGP)</Label>
                            <Input
                                id="dish-price"
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={values.price}
                                onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                                placeholder="195.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={values.category}
                                onValueChange={(val) =>
                                    setValues((v) => ({ ...v, category: val as DishFormValues["category"] }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appetizer">Appetizer</SelectItem>
                                    <SelectItem value="main">Main</SelectItem>
                                    <SelectItem value="dessert">Dessert</SelectItem>
                                    <SelectItem value="beverage">Beverage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dish-image">Image URL</Label>
                        <Input
                            id="dish-image"
                            value={values.imageUrl}
                            onChange={(e) => setValues((v) => ({ ...v, imageUrl: e.target.value }))}
                            placeholder="/hero-food-molokhia.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dish-stock">Stock (leave empty for unlimited)</Label>
                        <Input
                            id="dish-stock"
                            type="number"
                            min="0"
                            value={values.stock}
                            onChange={(e) => setValues((v) => ({ ...v, stock: e.target.value }))}
                            placeholder="Unlimited"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="dish-featured"
                            checked={values.featured}
                            onCheckedChange={(checked) =>
                                setValues((v) => ({ ...v, featured: checked === true }))
                            }
                        />
                        <Label htmlFor="dish-featured" className="font-normal">
                            Show in Signature Dishes section
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : dish ? "Save Changes" : "Add Dish"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}