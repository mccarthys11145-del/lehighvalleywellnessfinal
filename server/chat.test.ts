import { describe, it, expect, vi } from "vitest";
import { checkChatRateLimit, getQuickResponse } from "./chatService";

describe("Chat Service", () => {
  describe("getQuickResponse", () => {
    it("should return greeting for hello", () => {
      const response = getQuickResponse("hello");
      expect(response).toContain("Welcome to Lehigh Valley Wellness");
    });

    it("should return greeting for hi", () => {
      const response = getQuickResponse("Hi!");
      expect(response).toContain("Welcome to Lehigh Valley Wellness");
    });

    it("should return emergency response for emergency keywords", () => {
      const response = getQuickResponse("I have chest pain");
      expect(response).toContain("911");
      expect(response).toContain("emergency");
    });

    it("should return phone number for phone queries", () => {
      const response = getQuickResponse("What's your phone number?");
      expect(response).toContain("(484) 619-2876");
    });

    it("should return email for contact queries", () => {
      const response = getQuickResponse("How can I contact you?");
      expect(response).toContain("info@lehighvalleywellness.com");
    });

    it("should return null for complex questions", () => {
      const response = getQuickResponse("What are your weight loss program options?");
      expect(response).toBeNull();
    });
  });

  describe("checkChatRateLimit", () => {
    it("should allow first request", () => {
      const result = checkChatRateLimit("test-ip-1");
      expect(result).toBe(true);
    });

    it("should allow multiple requests within limit", () => {
      const ip = "test-ip-2";
      for (let i = 0; i < 10; i++) {
        expect(checkChatRateLimit(ip)).toBe(true);
      }
    });

    it("should block requests over limit", () => {
      const ip = "test-ip-3";
      // Use up all allowed requests
      for (let i = 0; i < 10; i++) {
        checkChatRateLimit(ip);
      }
      // 11th request should be blocked
      expect(checkChatRateLimit(ip)).toBe(false);
    });
  });
});
