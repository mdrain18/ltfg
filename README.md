# Legit Tools for Gaming
----------------------------------------------

###Overview:
A web application which reports, automates, and executes different admin commands on a dedicated gaming server

<pre>
To Get started From Project Setup
 1. <a href="https://github.com/mdrain18/ltfg/blob/master/how-to/InitializeDatabase">
            Install Postgres, setup the ltfg database, and create the ltfg_user account</a>

 2. Clone the project
    unix> git clone https://github.com/mdrain18/Legit-Tools-for-Gaming.git ltfg
    unix> cd ltfg
    unix> git checkout main

 3. Verify that the webapp works
    a. Compile the project (into an executable JAR)
       unix> mvn clean package -Pprod

    b. Run the executable jar
       unix> java -jar ./backend/target/backend-1.0-SNAPSHOT-exec.jar

    c. Connect to the webapp at
       http://localhost:8080/ltfg
 
 4. Setup Debugging in IntelliJ Ultimate
    a. Open the project in IntelliJ
    b. <a href="https://github.com/mdrain18/ltfg/blob/main/how-to/SetupDebug">Setup debugging (so you can debug TypeScript and Java code)</a>

</pre>
