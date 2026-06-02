// transport-client.js

"use strict";

const AbstractTransport = require("./transport-abstract.js");

class ClientTransport extends AbstractTransport {
  constructor(config = {}) {
    super(config);

    this._baseUrl = config.baseUrl || "";
    this._headers = { ...(config.headers || {}) };
    this._timeout = config.timeout || 30000;
  }

  /**
   * Execute an HTTP request using fetch().
   */
  async request(method, resource, options = {}) {
    const url = this._buildUrl(resource, options.params || {});

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

      if (options.data !== undefined && method !== "GET" && method !== "HEAD") {
        if (
          options.data &&
          typeof options.data === "object" &&
          !(options.data instanceof FormData) &&
          !(options.data instanceof URLSearchParams) &&
          !(options.data instanceof Blob)
        ) {
          headers["Content-Type"] =
            headers["Content-Type"] || "application/json";

          requestOptions.body = JSON.stringify(options.data);
        } else {
          requestOptions.body = options.data;
        }
      }

      const response = await fetch(url, requestOptions);

      const body = await this._parseResponse(response);

      if (!response.ok) {
        const error = new Error(`${response.status} ${response.statusText}`);

        error.name = "TransportError";
        error.status = response.status;
        error.statusText = response.statusText;
        error.response = body;

        throw error;
      }

      return body;
    } catch (error) {
      if (error.name === "AbortError") {
        const timeoutError = new Error(
          `Request timeout after ${options.timeout || this._timeout}ms`
        );

        timeoutError.name = "TimeoutError";

        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * HTTP GET
   */
  async get(resource, options = {}) {
    return this.request("GET", resource, options);
  }

  /**
   * HTTP POST
   */
  async post(resource, data = {}, options = {}) {
    return this.request("POST", resource, {
      ...options,
      data,
    });
  }

  /**
   * HTTP PUT
   */
  async put(resource, data = {}, options = {}) {
    return this.request("PUT", resource, {
      ...options,
      data,
    });
  }

  /**
   * HTTP PATCH
   */
  async patch(resource, data = {}, options = {}) {
    return this.request("PATCH", resource, {
      ...options,
      data,
    });
  }

  /**
   * HTTP DELETE
   */
  async delete(resource, options = {}) {
    return this.request("DELETE", resource, options);
  }

  /**
   * CRUD create
   */
  async create(resource, data = {}, options = {}) {
    return this.post(resource, data, options);
  }

  /**
   * CRUD read
   */
  async read(resource, options = {}) {
    return this.get(resource, options);
  }

  /**
   * CRUD update
   */
  async update(resource, data = {}, options = {}) {
    return this.put(resource, data, options);
  }

  /**
   * CRUD remove
   */
  async remove(resource, options = {}) {
    return this.delete(resource, options);
  }

  /**
   * Set a default header.
   */
  setHeader(name, value) {
    this._headers[name] = value;
    return this;
  }

  /**
   * Remove a default header.
   */
  removeHeader(name) {
    delete this._headers[name];
    return this;
  }

  /**
   * Replace all default headers.
   */
  setHeaders(headers = {}) {
    this._headers = { ...headers };
    return this;
  }

  /**
   * Update the base URL.
   */
  setBaseUrl(baseUrl) {
    this._baseUrl = baseUrl;
    return this;
  }

  /**
   * Build URL with query parameters.
   */
  _buildUrl(resource, params = {}) {
    const url = new URL(resource, this._baseUrl);

    for (const [key, value] of Object.entries(params)) {
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

    return url.toString();
  }

  /**
   * Parse response based on content type.
   */
  async _parseResponse(response) {
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
  }
}

module.exports = ClientTransport;
