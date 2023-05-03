package com.lessons.config;

import com.lessons.services.FileService;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.io.InputStream;

@Configuration
public class DataSourceConfig {

    @Resource
    private FileService fileService;

    @Value("${app.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${app.datasource.url}")
    private String url;

    @Value("${app.datasource.username}")
    private String username;

    @Value("${app.datasource.password}")
    private String password;

    @Value("${app.datasource.maxPoolSize:20}")
    private int maxPoolSize;

    @Value("${app.datasource.schema}")
    private String schemaName;

    @Value("${app.datasourceSQLite.database-path}")
    private String sqliteDBPath;

    // java -Dapp.RunFlywayCleanOnStartup=true -jar ./backend/target/backend-1.0-SNAPSHOT-exec.jar
    @Value("${app.RunFlywayCleanOnStartup:false}")
    private Boolean runFlywayCleanOnStartUp;

    @Bean
    @Primary
    public DataSource postgresDataSource() {
        HikariConfig hikariConfig = new HikariConfig();

        hikariConfig.setDriverClassName(this.driverClassName);
        hikariConfig.setJdbcUrl(this.url);
        hikariConfig.setUsername(this.username);
        hikariConfig.setPassword(this.password);
        hikariConfig.setMaximumPoolSize(this.maxPoolSize);
        hikariConfig.setConnectionTestQuery("SELECT 1");
        hikariConfig.setPoolName("ltfg_jdbc_connection_pool");

        HikariDataSource dataSource = new HikariDataSource(hikariConfig);

        // Initialize the flyway object by setting the data source and schema name
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas(schemaName)
                .load();

        // Use the flyway object to do a migrate on webapp startup
        if (this.runFlywayCleanOnStartUp) {
            flyway.clean();
        }
        flyway.migrate();

        return dataSource;
    }

    /**
     * 1) Delete game.db file if it exists
     * 2) Copy game.db file from to the ${java.io.tmpdir}/game.db
     * 3) Connect to using the above file path
     */
    @Bean
    public DataSource sqliteDataSource() throws Exception {

//        // Delete the game.db file if it's there
//        fileService.deleteFileInFileSystemIfExists(this.sqliteDBPath);
//
//        // Copy the input stream (game.db) source/main/resources to the tmp directory
//        InputStream inputStream = this.getClass().getResourceAsStream("/sqliteDBs/game.db");
//        fileService.addFileToRegularFilesystem(inputStream, this.sqliteDBPath);

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.sqlite.JDBC");
        dataSource.setUrl("jdbc:sqlite:" + this.sqliteDBPath);
        return dataSource;
    }

    @Bean
    @Qualifier("postgresJdbcTemplate")
    public JdbcTemplate postgresJdbcTemplate(@Qualifier("postgresDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    @Qualifier("sqliteJdbcTemplate")
    public JdbcTemplate sqliteJdbcTemplate(@Qualifier("sqliteDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

}
