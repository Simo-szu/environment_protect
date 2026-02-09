package com.youthloop.social.api.contract;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class BaseResponseUsageGuardTest {

    @Test
    void shouldNotUseBaseResponseOutsideLegacyClass() throws IOException {
        Path repoRoot = locateRepoRoot();
        List<String> violations = new ArrayList<>();

        try (Stream<Path> files = Files.walk(repoRoot)) {
            files.filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith(".java"))
                .forEach(path -> inspectJavaFile(repoRoot, path, violations));
        }

        assertTrue(violations.isEmpty(),
            () -> "Forbidden BaseResponse usage found:\n" + String.join("\n", violations));
    }

    private void inspectJavaFile(Path repoRoot, Path path, List<String> violations) {
        String relative = repoRoot.relativize(path).toString().replace('\\', '/');
        if (!relative.contains("/src/main/java/")) {
            return;
        }
        if (relative.equals("modules/common/src/main/java/com/youthloop/common/api/BaseResponse.java")) {
            return;
        }

        try {
            List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line.contains("com.youthloop.common.api.BaseResponse")
                    || line.matches(".*\\bBaseResponse\\b.*")) {
                    violations.add(relative + ":" + (i + 1) + " -> " + line.trim());
                }
            }
        } catch (IOException e) {
            violations.add(relative + ":0 -> failed to read file: " + e.getMessage());
        }
    }

    private Path locateRepoRoot() {
        Path current = Paths.get("").toAbsolutePath().normalize();
        while (current != null) {
            if (Files.exists(current.resolve("pom.xml"))
                && Files.exists(current.resolve("apps"))
                && Files.exists(current.resolve("modules"))) {
                return current;
            }
            current = current.getParent();
        }
        throw new IllegalStateException("Unable to locate repository root");
    }
}
