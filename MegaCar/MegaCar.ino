#define SPEEDR 8
#define SPEEDL 9
#define R1 4
#define R2 5
#define L1 6
#define L2 7
#define MAXSPEED 40 //Don't make it higher than 120
#define FORWARD 31
#define BACKWARDS 33
#define RIGHT 35
#define LEFT 37
#define STOP 39
#define SPEED A0
#define CONNECTED 52 
#define FORWARDLED A10
#define BACKWARDSLED A11
#define RIGHTLED A12
#define LEFTLED A13
#define STOPLED A9
#define CONNECTEDLED A8
int connected = 0;
int speed = 0;
int temp = 0;
void forward(), backwards(), left(), right(), stopc();

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
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
  stopc();
}

void loop() {
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
  
  delay(110);
}

void forward(){
//  Serial.println("Forward");
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
void backwards(){
//  Serial.println("Backwards");
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
void right(){
//  Serial.println("Right");
  digitalWrite(R1, HIGH);
  digitalWrite(R2, LOW);
  digitalWrite(L1, LOW);
  digitalWrite(L2, HIGH);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, HIGH);
  digitalWrite(LEFTLED, LOW);
  digitalWrite(STOPLED, LOW);
}
void left(){
//  Serial.println("Left");
  digitalWrite(R1, LOW);
  digitalWrite(R2, HIGH);
  digitalWrite(L1, HIGH);
  digitalWrite(L2, LOW);
  digitalWrite(FORWARDLED, LOW);
  digitalWrite(BACKWARDSLED, LOW);
  digitalWrite(RIGHTLED, LOW);
  digitalWrite(LEFTLED, HIGH);
  digitalWrite(STOPLED, LOW);
}
void stopc(){
//  if (digitalRead(STOP)) {
//    Serial.println("Stop");
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
