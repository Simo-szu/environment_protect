package com.youthloop.social.api.web.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API 文档（Scalar UI）
 *
 * 说明：
 * - OpenAPI JSON 仍由 springdoc 暴露在 /v3/api-docs
 * - /api-docs 提供更易读的 UI 页面
 */
@RestController
public class ApiDocsController {

    private static final String HTML = """
        <!doctype html>
        <html lang="zh-CN">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>API Docs</title>
          </head>
          <body>
            <div id="app"></div>
            <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
            <script>
              Scalar.createApiReference('#app', {
                url: '/v3/api-docs'
              })
            </script>
            <noscript>请启用 JavaScript 以查看 API 文档。</noscript>
          </body>
        </html>
        """;

    @GetMapping(value = "/api-docs", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> apiDocs() {
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(HTML);
    }
}
