#define SPEEDR 8
#define SPEEDL 9
#define R1 4
#define R2 5
#define L1 6
#define L2 7
#define MAXSPEED 120
#define FORWARD 31
#define BACKWARDS 33
#define RIGHT 35
#define LEFT 37
#define STOP 39
#define FORWARDLED 22
#define BACKWARDSLED 24
#define RIGHTLED 26
#define LEFTLED 37
#define STOPLED 39
void forward(), backwards(), left(), right(), stop();

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
  stop();
}

void loop() {
  // put your main code here, to run repeatedly:
  if (digitalRead(FORWARD)) {
    forward();
  } else if (digitalRead(BACKWARDS)) {
    backwards();
  } else if (digitalRead(RIGHT)) {
    right();
  } else if (digitalRead(LEFT)) {
    left();
  } else if (digitalRead(STOP)) {
    stop();
  } else {
    stop();
  }
  delay(110);
}

void forward(){
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
void backwards(){
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
void right(){
  Serial.println("Right");
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
  Serial.println("Left");
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
void stop(){
  if (digitalRead(STOP)) {
    Serial.println("Stop");
  }
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