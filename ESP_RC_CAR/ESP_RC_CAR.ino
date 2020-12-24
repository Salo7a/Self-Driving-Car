#include <ESP8266WiFi.h>
#include <ESP8266SSDP.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

//const char* ssid = "BODY-ALREFAEY-9031";
//const char* password = "%rG15399";

//const char* ssid = "Refaey";
//const char* password = "Body@12345";

//const char* ssid = "STUDBME2";
//const char* password = "BME2Stud";

const char* ssid = "Cold";
const char* password = "Salah19998";

int auto_mode = 0;
String rfid_reading = "N/A";
String distance = "x";
String temp = "";
String AllData = "N/A,50,50";
#define CONNECTED D1
#define FORWARD D2
#define BACKWARDS D3  
#define RIGHT D5
#define LEFT D6
#define SPEED D7
#define STOP D8

const int port = 80;
ESP8266WebServer server(port);
void connectToWiFi(), handleNotFound();

void setup() {
  // put your setup code here, to run once:
  
    Serial.begin(9600);
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);
    connectToWiFi();
    pinMode(CONNECTED, OUTPUT);
    pinMode(FORWARD, OUTPUT);
    pinMode(BACKWARDS, OUTPUT);
    pinMode(RIGHT, OUTPUT);    
    pinMode(LEFT, OUTPUT);
    pinMode(STOP, OUTPUT);
    pinMode(SPEED, OUTPUT);
    analogWrite(SPEED, 1023);
    digitalWrite(CONNECTED, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(RIGHT, LOW);
    digitalWrite(LEFT, LOW);
    digitalWrite(STOP, LOW);
    if (MDNS.begin("nodemcu")) {
      Serial.println("MDNS Responder Started");
    }
     //SSDP makes device visible on windows network
    server.on("/description.xml", HTTP_GET, [&]() {
      SSDP.schema(server.client());
    });
    SSDP.setSchemaURL("description.xml");
    SSDP.setHTTPPort(80);
    SSDP.setName("CoolESP");
    SSDP.setModelName("esp8266");
    SSDP.setSerialNumber("1234");
    SSDP.setManufacturer("Nobody");
    SSDP.setURL("/");
    SSDP.setInterval(1);
    SSDP.setDeviceType("upnp:rootdevice");
    SSDP.begin();
    server.on("/forward", [](){
      Serial.println("forward");
      digitalWrite(CONNECTED, LOW);
      digitalWrite(BACKWARDS, LOW);
      digitalWrite(LEFT, LOW);
      digitalWrite(RIGHT, LOW);
      digitalWrite(FORWARD, HIGH);
      digitalWrite(STOP, LOW);
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "text/plain", "forward");
    });

  server.on("/backward", [](){
    Serial.println("back");
    digitalWrite(FORWARD, LOW);
    digitalWrite(LEFT, LOW);
    digitalWrite(RIGHT, LOW);
    digitalWrite(BACKWARDS, HIGH);
    digitalWrite(STOP, LOW);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "back");
  });

  server.on("/right", [](){
    Serial.println("right");
    digitalWrite(LEFT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(RIGHT, HIGH);
    digitalWrite(STOP, LOW);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "right");
  });

  server.on("/left", [](){
    Serial.println("left");
    digitalWrite(RIGHT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(LEFT, HIGH);
    digitalWrite(STOP, LOW);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "left");
  });

  server.on("/stop", [](){
    Serial.println("stop");
    digitalWrite(RIGHT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(LEFT, LOW);
    digitalWrite(STOP, HIGH);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Stop");
  });

  server.on("/rfid", [](){
    Serial.println("rfid");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", rfid_reading);
  });

  server.on("/distance", [](){
    Serial.println("distance");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", distance);
  });
  
    server.on("/data", [](){
        if (Serial.available()) { // If anything comes in Serial (USB),
          while(Serial.read() != '$'){
            
          }
          temp = Serial.readStringUntil('@');
      
          AllData = temp;
      
//      Serial.println(temp);   // read it and send it out Serial1 (pins 0 & 1)
    }
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", AllData);
  });
  server.on("/play", [](){
    Serial.println("play");
    auto_mode = 1;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Play");
  });

  server.on("/check", [](){
    Serial.println("check");
    if (auto_mode == 1) {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "text/plain", "on");
    } else {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "text/plain", "off");
    }
  });

  server.on("/speed", [](){
    if (!server.hasArg("value")) {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(404, "text / plain", "Speed undefined");
      return;
    }
    String directionS = server.arg("value");
    int speed = directionS.toInt();
    analogWrite(SPEED, speed);
    Serial.println(speed);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text / plain", server.arg("value"));
  });
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP Server Started");
}

void loop() {
  server.handleClient();
  // put your main code here, to run repeatedly:
     if(WiFi.status() != WL_CONNECTED)
    {
      connectToWiFi();
    }
    server.handleClient();
    digitalWrite(CONNECTED, HIGH);
    MDNS.update();
    server.handleClient();
    Serial.flush();
}
void connectToWiFi()
{
  // connect to wifi.
    WiFi.begin(ssid, password);
    Serial.print("connecting");
    
    while (WiFi.status() != WL_CONNECTED)
    {
        pinMode(LED_BUILTIN, LOW);
        delay(250);
        pinMode(LED_BUILTIN, HIGH);
        delay(250);
        Serial.print(".");
        delay(100);
        digitalWrite(CONNECTED, LOW);
        digitalWrite(RIGHT, LOW);
        digitalWrite(FORWARD, LOW);
        digitalWrite(BACKWARDS, LOW);
        digitalWrite(LEFT, LOW);
        digitalWrite(STOP, LOW);
    }

    Serial.println();
    Serial.print("connected: ");
    Serial.println(WiFi.localIP());
}

void handleNotFound() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(404, "text / plain", "404: Not found");
}
