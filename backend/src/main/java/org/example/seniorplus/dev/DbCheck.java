package org.example.seniorplus.dev;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    private static final Logger log = LoggerFactory.getLogger(DbCheck.class);

    public static void main(String[] args) {
        String url = System.getProperty("db.url");
        String user = System.getProperty("db.user");
        String pass = System.getProperty("db.pass");

        // Fallback to environment variables if system properties are not provided
        if ((url == null || url.isBlank()) && System.getenv("DB_URL") != null) {
            url = System.getenv("DB_URL");
        }
        if ((user == null || user.isBlank()) && System.getenv("DB_USER") != null) {
            user = System.getenv("DB_USER");
        }
        if ((pass == null || pass.isBlank()) && System.getenv("DB_PASS") != null) {
            pass = System.getenv("DB_PASS");
        }

        if (url == null || url.isBlank()) {
            log.error("Missing system property: -Ddb.url");
            System.exit(2);
        }

        log.info("Attempting JDBC connection to {} as user {}", url, user);

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String product = conn.getMetaData().getDatabaseProductName();
            String version = conn.getMetaData().getDatabaseProductVersion();
            log.info("Connected to DB: {} ({})", product, version);
            try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery("SELECT 1")) {
                if (rs.next()) {
                    log.info("Query OK: SELECT 1 -> {}", rs.getInt(1));
                }
            }
        } catch (Exception e) {
            log.error("DB connection failed", e);
            System.exit(1);
        }
    }
}
