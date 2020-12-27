#include <SPI.h>
#include <MFRC522.h>
#include "AsyncSonarLib.h"
#define RST_PIN 11
#define SS_PIN 53

#define SPEEDR 8
#define SPEEDL 10
#define L1 4
#define L2 5
#define R1 6
#define R2 7
#define MAXSPEED 80 //Don't make it higher than 120
#define FORWARD 31
#define BACKWARDS 33
#define RIGHT 35
#define LEFT 37
#define STOP 39
#define SPEED A0
#define CONNECTED 9
#define FORWARDLED A10
#define BACKWARDSLED A11
#define RIGHTLED A12
#define LEFTLED A13
#define STOPLED A9
#define CONNECTEDLED 21
#define LSONIC A8
#define RSONIC A15
int connected = 0;
int speed = 0;
int temp = 0;
MFRC522 mfrc522(SS_PIN, RST_PIN);

MFRC522::MIFARE_Key key;
String RFID = "";
String Data = "";
volatile bool bNewInt = false;
byte regVal = 0x7F;
void activateRec(MFRC522 mfrc522);
void clearInt(MFRC522 mfrc522);

void forward(), backwards(), left(), right(), stopc();
//void PingRRecieved(AsyncSonar& sonar)
//{
//  Serial.print("Right: ");
//  Serial.println(sonar.GetMeasureMM()/10);
//}
//
//// timeout callback
//void TimeOutR(AsyncSonar& sonar)
//{
//  Serial.println("TimeOut Right");
//}
//void PingLRecieved(AsyncSonar& sonar)
//{
//  Serial.print("Left: ");
//  Serial.println(sonar.GetMeasureMM()/10);
//}
//
//// timeout callback
//void TimeOutL(AsyncSonar& sonar)
//{
//  Serial.println("TimeOut Left");
//}

AsyncSonar RightS (RSONIC);
AsyncSonar LeftS (LSONIC);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial3.begin(9600);
  pinMode(SPEEDL, OUTPUT);
  pinMode(SPEEDR, OUTPUT);
  pinMode(R1, OUTPUT);
  pinMode(R2, OUTPUT);
  pinMode(L1, OUTPUT);
  pinMode(L2, OUTPUT);
  pinMode(STOPLED, OUTPUT);
  analogWrite(SPEEDL, MAXSPEED);
  analogWrite(SPEEDR, MAXSPEED);
  pinMode(FORWARD, INPUT);
  pinMode(BACKWARDS, INPUT);
  pinMode(RIGHT, INPUT);
  pinMode(LEFT, INPUT);
  pinMode(STOP, INPUT);
  pinMode(CONNECTED, INPUT);
  pinMode(SPEED, INPUT);
  pinMode(FORWARDLED, OUTPUT);
  pinMode(BACKWARDSLED, OUTPUT);
  pinMode(RIGHTLED, OUTPUT);
  pinMode(LEFTLED, OUTPUT);
  pinMode(STOPLED, OUTPUT);
  pinMode(CONNECTEDLED, OUTPUT);
  //  pinMode(IRQ_PIN, INPUT_PULLUP);
  stopc();
  SPI.begin();          // Init SPI bus
  mfrc522.PCD_Init(); // Init MFRC522 card
  regVal = 0xA0; //rx irq
  //  mfrc522.PCD_WriteRegister(mfrc522.ComIEnReg, regVal);
  //
  //  bNewInt = false; //interrupt flag
  //
  //  /*Activate the interrupt*/
  //  attachInterrupt(digitalPinToInterrupt(IRQ_PIN), readCard, FALLING);
  LeftS.Start();
  RightS.Start();
}


void loop() {
  LeftS.Start();
  RightS.Start();
  // put your main code here, to run repeatedly:
  connected = digitalRead(CONNECTED);
  if (connected) {
    digitalWrite(CONNECTEDLED, HIGH);
    //     temp = analogRead(SPEED);
    //     delay(10);
    //     Serial.println(temp);
    // speed = map(temp, 0, 700, 0, MAXSPEED);
    // analogWrite(SPEEDL, speed);
    // analogWrite(SPEEDR, speed);
    // Serial.println(speed);
    if (digitalRead(FORWARD)) {
      forward();
    } else if (digitalRead(BACKWARDS)) {
      backwards();
    } else if (digitalRead(RIGHT)) {
      right();
    } else if (digitalRead(LEFT)) {
      left();
    } else if (digitalRead(STOP)) {
      stopc();
    } else {
      stopc();
    }
  } else {
    Serial.println("ALL OFF");
    digitalWrite(CONNECTEDLED, LOW);
    digitalWrite(FORWARDLED, LOW);
    digitalWrite(BACKWARDSLED, LOW);
    digitalWrite(RIGHTLED, LOW);
    digitalWrite(LEFTLED, LOW);
    digitalWrite(STOPLED, LOW);
    digitalWrite(R1, LOW);
    digitalWrite(R2, LOW);
    digitalWrite(L1, LOW);
    digitalWrite(L2, LOW);
  }

  if (mfrc522.PICC_IsNewCardPresent()) {
    mfrc522.PICC_ReadCardSerial(); //read the tag data
    // Show some details of the PICC (that is: the tag/card)
    Serial.print(F("Card UID:"));
    dump_byte_array(mfrc522.uid.uidByte, mfrc522.uid.size);
    Serial.println();
    Serial.println(RFID);
    //    clearInt(mfrc522);
    mfrc522.PICC_HaltA();
    // Stop encryption on PCD
    mfrc522.PCD_StopCrypto1();
  }
  //   activateRec(mfrc522);
  delay(50);
  LeftS.Update();
  RightS.Update();
  // The receiving block needs regular retriggering (tell the tag it should transmit??)
  //   mfrc522.PCD_WriteRegister(mfrc522.FIFODataReg,mfrc522.PICC_CMD_REQA);
  //    Serial.print("Left: ");
  //  Serial.print(LeftS.GetMeasureMM()/10);
  //  Serial.print(", Right: ");
  //  Serial.println(RightS.GetMeasureMM()/10);
  Data = "$" + RFID + "," + String(LeftS.GetMeasureMM() / 10) + "," + String(RightS.GetMeasureMM() / 10) + "@";
  Serial.println(Data);
  Serial3.print(Data);
}

void forward() {
  Serial.println("Forward");
  digitalWrite(R1, HIGH);
  digitalWrite(R2, LOW);
  digitalWrite(L1, HIGH);
  digitalWrite(L2, LOW);
  digitalWrite(FORWARDLED, HIGH);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, LOW);
  digitalWrite(LEFTLED, LOW);
  digitalWrite(STOPLED, LOW);
}
void backwards() {
  Serial.println("Backwards");
  digitalWrite(R1, LOW);
  digitalWrite(R2, HIGH);
  digitalWrite(L1, LOW);
  digitalWrite(L2, HIGH);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, HIGH);
  digitalWrite(RIGHTLED, LOW);
  digitalWrite(LEFTLED, LOW);
  digitalWrite(STOPLED, LOW);
}
void right() {
  Serial.println("Right");
  analogWrite(SPEEDL, 115);
  analogWrite(SPEEDR, 115);
  digitalWrite(R1, HIGH);
  digitalWrite(R2, LOW);
  digitalWrite(L1, LOW);
  digitalWrite(L2, LOW);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, HIGH);
  digitalWrite(LEFTLED, LOW);
  digitalWrite(STOPLED, LOW);
}
void left() {
  Serial.println("Left");
  analogWrite(SPEEDL, 125);
  analogWrite(SPEEDR, 125);
  digitalWrite(R1, LOW);
  digitalWrite(R2, LOW);
  digitalWrite(L1, HIGH);
  digitalWrite(L2, LOW);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, LOW);
  digitalWrite(LEFTLED, HIGH);
  digitalWrite(STOPLED, LOW);
}
void stopc() {
  //  if (digitalRead(STOP)) {
  Serial.println("Stop");
  //  }
  digitalWrite(R1, LOW);
  digitalWrite(R2, LOW);
  digitalWrite(L1, LOW);
  digitalWrite(L2, LOW);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, LOW);
  digitalWrite(LEFTLED, LOW);
  digitalWrite(STOPLED, HIGH);
}

/**
   Helper routine to dump a byte array as hex values to Serial.
*/
void dump_byte_array(byte *buffer, byte bufferSize) {
  RFID = "";
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
    //    Serial3.print(buffer[i] < 0x10 ? " 0" : " ");
    //    Serial3.print(buffer[i], HEX);
    RFID += String(buffer[i] < 0x10 ? " 0" : " ");
    RFID += String(buffer[i], HEX);
  }
}
/**
   MFRC522 interrupt serving routine
*/
void readCard() {
  bNewInt = true;
}

/*
   The function sending to the MFRC522 the needed commands to activate the reception
*/
void activateRec(MFRC522 mfrc522) {
  mfrc522.PCD_WriteRegister(mfrc522.FIFODataReg, mfrc522.PICC_CMD_REQA);
  mfrc522.PCD_WriteRegister(mfrc522.CommandReg, mfrc522.PCD_Transceive);
  mfrc522.PCD_WriteRegister(mfrc522.BitFramingReg, 0x87);
}

/*
   The function to clear the pending interrupt bits after interrupt serving routine
*/
void clearInt(MFRC522 mfrc522) {
  mfrc522.PCD_WriteRegister(mfrc522.ComIrqReg, 0x7F);
}
