import { IsIn } from "class-validator";

export type PriceKey = "monthly" | "quarterly" | "yearly" | "lifetime";

export class CheckoutSessionDto {
    @IsIn(["monthly", "quarterly", "yearly", "lifetime"])
    priceKey!: PriceKey;
}
