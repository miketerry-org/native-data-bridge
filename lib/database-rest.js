// database-rest.js

"use strict";

const AbstractDatabase = require("./database-abstract.js");

class RestDatabase extends AbstractDatabase {
  _baseUrl;
  _headers;
  _timeout;

  constructor(config = {}) {
    super(config);

    this._baseUrl = config.baseUrl || "";
    this._headers = { ...(config.headers || {}) };
    this._timeout = config.timeout || 30000;
  }

  /**
   * No real connection required.
   */
  async connect() {
    this._setConnected(true);
    return this;
  }

  /**
   * No real connection required.
   */
  async disconnect() {
    this._setConnected(false);
  }

  /**
   * Build URL for resource.
   */
  _buildUrl(resource, options = {}) {
    const url = new URL(resource, this._baseUrl);

    const where = options.where || {};

    for (const [key, value] of Object.entries(where)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, item);
        }
      } else {
        url.searchParams.append(key, value);
      }
    }

    if (options.limit) {
      url.searchParams.set("limit", options.limit);
    }

    if (options.offset) {
      url.searchParams.set("offset", options.offset);
    }

    if (options.orderBy) {
      url.searchParams.set("orderBy", options.orderBy);
    }

    return url.toString();
  }

  /**
   * Execute request.
   */
  _request(method, resource, body, options = {}) {
    const url = this._buildUrl(resource, options);

    const headers = {
      ...this._headers,
      ...(options.headers || {}),
    };

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      options.timeout || this._timeout
    );

    try {
      const requestOptions = {
        method,
        headers,
        signal: controller.signal,
      };

      if (
        body !== undefined &&
        body !== null &&
        method !== "GET" &&
        method !== "HEAD"
      ) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";

        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const text = await response.text();

        const error = new Error(`${response.status} ${response.statusText}`);

        error.status = response.status;

        error.response = text;

        throw error;
      }

      if (method === "HEAD") {
        return true;
      }

      if (response.status === 204 || response.status === 205) {
        return null;
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        return response.json();
      }

      if (contentType.startsWith("text/")) {
        return response.text();
      }

      return response.arrayBuffer();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Request timeout after ${options.timeout || this._timeout}ms`
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * GET
   */
  async get(resource, options = {}) {
    return this._request("GET", resource, null, options);
  }

  /**
   * POST
   */
  async post(resource, values = {}, options = {}) {
    return this._request("POST", resource, values, options);
  }

  /**
   * PUT
   */
  async put(resource, values = {}, options = {}) {
    return this._request("PUT", resource, values, options);
  }

  /**
   * PATCH
   */
  async patch(resource, values = {}, options = {}) {
    return this._request("PATCH", resource, values, options);
  }

  /**
   * DELETE
   */
  async delete(resource, options = {}) {
    return this._request("DELETE", resource, null, options);
  }

  /**
   * HEAD
   */
  async head(resource, options = {}) {
    try {
      await this._request("HEAD", resource, null, options);

      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }

      throw error;
    }
  }

  /**
   * Default header helpers.
   */
  setHeader(name, value) {
    this._headers[name] = value;
    return this;
  }

  removeHeader(name) {
    delete this._headers[name];
    return this;
  }

  setHeaders(headers = {}) {
    this._headers = { ...headers };
    return this;
  }

  setBaseUrl(baseUrl) {
    this._baseUrl = baseUrl;
    return this;
  }
}

module.exports = RestDatabase;
