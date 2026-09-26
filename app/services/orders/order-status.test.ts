import { describe, expect, it } from "vitest";

import {
  canTransitionOrderStatus,
  getOrderEmailSubject,
  isValidOrderStatus,
  shouldSetDeliveredAt,
  shouldSetShippedAt,
} from "./order-status";

describe("order status rules", () => {
  it("recognizes every valid order status", () => {
    for (const status of [
      "placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]) {
      expect(isValidOrderStatus(status)).toBe(true);
    }
  });

  it("rejects invalid order statuses", () => {
    expect(isValidOrderStatus("paid")).toBe(false);
    expect(isValidOrderStatus("failed")).toBe(false);
    expect(isValidOrderStatus("unknown")).toBe(false);
    expect(isValidOrderStatus(null)).toBe(false);
    expect(isValidOrderStatus(123)).toBe(false);
  });

  it("allows the normal order lifecycle", () => {
    expect(
      canTransitionOrderStatus("placed", "confirmed"),
    ).toBe(true);

    expect(
      canTransitionOrderStatus("confirmed", "processing"),
    ).toBe(true);

    expect(
      canTransitionOrderStatus("processing", "shipped"),
    ).toBe(true);

    expect(
      canTransitionOrderStatus("shipped", "delivered"),
    ).toBe(true);
  });

  it("allows cancellation before shipment", () => {
    expect(
      canTransitionOrderStatus("placed", "cancelled"),
    ).toBe(true);

    expect(
      canTransitionOrderStatus("confirmed", "cancelled"),
    ).toBe(true);

    expect(
      canTransitionOrderStatus("processing", "cancelled"),
    ).toBe(true);
  });

  it("rejects invalid lifecycle jumps", () => {
    expect(
      canTransitionOrderStatus("placed", "processing"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("placed", "shipped"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("confirmed", "shipped"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("processing", "delivered"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("shipped", "processing"),
    ).toBe(false);
  });

  it("makes delivered and cancelled terminal states", () => {
    expect(
      canTransitionOrderStatus("delivered", "processing"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("delivered", "cancelled"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("cancelled", "confirmed"),
    ).toBe(false);

    expect(
      canTransitionOrderStatus("cancelled", "processing"),
    ).toBe(false);
  });

  it("allows an idempotent same-status transition", () => {
    for (const status of [
      "placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]) {
      expect(
        canTransitionOrderStatus(status, status as never),
      ).toBe(true);
    }
  });

  it("sets shipped_at for shipped and delivered", () => {
    expect(shouldSetShippedAt("shipped")).toBe(true);
    expect(shouldSetShippedAt("delivered")).toBe(true);
    expect(shouldSetShippedAt("processing")).toBe(false);
    expect(shouldSetShippedAt("confirmed")).toBe(false);
  });

  it("sets delivered_at only for delivered", () => {
    expect(shouldSetDeliveredAt("delivered")).toBe(true);
    expect(shouldSetDeliveredAt("shipped")).toBe(false);
    expect(shouldSetDeliveredAt("processing")).toBe(false);
  });

  it("generates the correct customer email subjects", () => {
    expect(
      getOrderEmailSubject("confirmed", "MN-123"),
    ).toBe("Your MineNote order is confirmed ✅");

    expect(
      getOrderEmailSubject("processing", "MN-123"),
    ).toBe("Your MineNote order is being prepared ⚙️");

    expect(
      getOrderEmailSubject("shipped", "MN-123"),
    ).toBe("Your MineNote order has shipped 📦");

    expect(
      getOrderEmailSubject("delivered", "MN-123"),
    ).toBe("Your MineNote order has been delivered 🎉");

    expect(
      getOrderEmailSubject("cancelled", "MN-123"),
    ).toBe("Your MineNote order has been cancelled");
  });

  it("uses the order ID for unknown email statuses", () => {
    expect(
      getOrderEmailSubject("placed", "MN-456"),
    ).toBe("MineNote Order Update — MN-456");
  });
});
