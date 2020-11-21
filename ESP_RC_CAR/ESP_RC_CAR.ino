#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "Catalyst";
const char* password = "Shepard98";

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
  
    Serial.begin(115200);
    Serial1.begin(115200);
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);
    connectToWiFi();
    pinMode(CONNECTED, OUTPUT);
    pinMode(FORWARD, OUTPUT);
    pinMode(BACKWARDS, OUTPUT);
    pinMode(LEFT, OUTPUT);
    pinMode(RIGHT, OUTPUT);
    pinMode(STOP, OUTPUT);
    pinMode(SPEED, OUTPUT);
    analogWrite(A0, 1024);

  server.on("/forward", [](){
    Serial.println("forward");
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(LEFT, LOW);
    digitalWrite(RIGHT, LOW);
    digitalWrite(FORWARD, HIGH);
    server.send(200, "text/plain", "forward");
  });

  server.on("/back", [](){
    Serial.println("back");
    digitalWrite(FORWARD, LOW);
    digitalWrite(LEFT, LOW);
    digitalWrite(RIGHT, LOW);
    digitalWrite(BACKWARDS, HIGH);
    server.send(200, "text/plain", "back");
  });

  server.on("/right", [](){
    Serial.println("right");
    digitalWrite(LEFT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(RIGHT, HIGH);
    server.send(200, "text/plain", "right");
  });

  server.on("/left", [](){
    Serial.println("left");
    digitalWrite(RIGHT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(LEFT, HIGH);
    server.send(200, "text/plain", "left");
  });

  server.on("/stop", [](){
    Serial.println("stop");
    digitalWrite(RIGHT, LOW);
    digitalWrite(FORWARD, LOW);
    digitalWrite(BACKWARDS, LOW);
    digitalWrite(LEFT, LOW);
    server.send(200, "text/plain", "Stop");
  });
  server.on("/speed", [](){
    if (!server.hasArg("value")) {
      server.send(404, "text / plain", "Speed undefined");
      return;
    }
    String directionS = server.arg("value");
    int speed = directionS.toInt();
    analogWrite(A0, speed);
    Serial.println(speed);
    server.send(200, "text / plain", server.arg("value"));
  });
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP Server Started");
}

void loop() {
  // put your main code here, to run repeatedly:
     if(WiFi.status() != WL_CONNECTED)
    {
      connectToWiFi();
    }
    server.handleClient();
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
    }

    Serial.println();
    Serial.print("connected: ");
    Serial.println(WiFi.localIP());
    Serial1.println(WiFi.localIP());
    digitalWrite(CONNECTED, HIGH)
}

void handleNotFound() {
  server.send(404, "text / plain", "404: Not found");
}