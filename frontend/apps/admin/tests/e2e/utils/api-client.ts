import type { APIRequestContext } from "@playwright/test";
import { API } from "../constants";

/**
 * API client for test setup/teardown — create data via API, not UI.
 */
export class HalyoonTestClient {
  constructor(
    private ctx: APIRequestContext,
    private adminApiURL: string = "http://localhost:8080",
    private token: string = ""
  ) {}

  private headers() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    const frontApiURL = process.env.FRONT_API_URL || "http://localhost:8081";
    const res = await this.ctx.post(`${frontApiURL}/api/auth/login`, {
      data: { email, password },
    });
    const data = await res.json();
    this.token = data.access_token;
  }

  async createVideo(data: {
    title: string;
    category: string;
    source_type?: string;
  }): Promise<any> {
    const res = await this.ctx.post(`${this.adminApiURL}${API.ADMIN_CONTENT_VIDEOS}`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data: { source_type: "studio_produced", language: "ar", dialect: "msa", ...data },
    });
    return res.json();
  }

  async updateVideoStatus(videoId: number, status: string): Promise<any> {
    const res = await this.ctx.patch(`${this.adminApiURL}${API.ADMIN_CONTENT_VIDEOS}/${videoId}/status`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data: { status },
    });
    return res.json();
  }

  async createIdea(data: { title: string; category?: string }): Promise<any> {
    const res = await this.ctx.post(`${this.adminApiURL}${API.ADMIN_STUDIO_IDEAS}`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data,
    });
    return res.json();
  }

  async deleteVideo(videoId: number): Promise<void> {
    // Archive the video (soft delete)
    await this.updateVideoStatus(videoId, "archived");
  }
}
