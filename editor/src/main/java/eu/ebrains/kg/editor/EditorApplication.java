package eu.ebrains.kg.editor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableAutoConfiguration
@ComponentScan
public class EditorApplication extends WebSecurityConfigurerAdapter {

    public static void main(String[] args) {
        SpringApplication.run(EditorApplication.class, args);
    }

    protected void configure(HttpSecurity http) throws Exception {
        /**
         *  The http security is quite simple here because we're just fast-forwarding the token
         *  ( {@link eu.ebrains.kg.editor.configuration.OauthClient ) to KG core and
         *  let this one manage the access permissions....
         */
        //FIXME We want to enable CSRF -> https://kanban.ebrains.eu/kg/planning/-/issues/635
        http.csrf().disable();
        http.authorizeRequests(a -> a.anyRequest().permitAll());
    }

}
