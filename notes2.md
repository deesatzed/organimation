To view keyboard shortcuts, press question mark
View keyboard shortcuts
Top
Latest
People
Media
Lists
Search timeline
きんぞ
@TakagiHitoshi
·
Jul 25
//so much on this for now #つぶやきProcessing #p5js
t=0
draw=_=>{createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=0;i<W;i++)
translate(150*cos(T=(i+t)/W*TAU)+w,150*sin(T)+w),
fill(abs(R=W*sin(t/3-T)),w,w),
rotate(t/19),
rect(0,0,28),
resetMatrix()
++t}
きんぞ
@TakagiHitoshi
·
13h
//#つぶやきProcessing #p5js
t=0,B=-1,C=.5
setup=_=>{
for(i=0,X=[];i<100;i++)
X.push(random(-1,1))
}
draw=_=>{
t||createCanvas(W=(w=200)*2,W)
colorMode(HSB)
for(i=0,x=X[t%100],y=B*x;i<W*4;i++)
stroke((i/360+t)%360,w,w),
x1=x,
point((x=1+y-C*abs(x))*w+150,(y=B*x1)*w+300)
++t}
Akira
@akira2768922
·
Dec 26, 2021
#つぶやきProcessing
t=0
draw=_=>{t++||createCanvas(W=600,W,WEBGL)
lights(background(W))
T=translate
X=rotateX
Z=rotateZ
rotateY(Q=PI/2)
Z(.9)
for(j=26;j--;pop())
for(push(u=t/60%2)+T(0,98*(u-j+3))+X(j%2?0:2*Q),i=6;i--;T(0,49))box(1,97)+X(i%2?-Q:Q)+T(0,49)+Z(map(i-u+j,7,8,Q,0,1))}
きんぞ
@TakagiHitoshi
·
13h
Lozi Map
http://padyn.wikidot.com/lozi-maps

https://openprocessing.org/@TakagiHitoshi
/2984306

#p5js #つぶやきProcessing #openprocessing
Quote
きんぞ
@TakagiHitoshi
·
13h
//#つぶやきProcessing #p5js
t=0,B=-1,C=.5
setup=_=>{
for(i=0,X=[];i<100;i++)
X.push(random(-1,1))
}
draw=_=>{
t||createCanvas(W=(w=200)*2,W)
colorMode(HSB)
for(i=0,x=X[t%100],y=B*x;i<W*4;i++)
stroke((i/360+t)%360,w,w),
x1=x,
point((x=1+y-C*abs(x))*w+150,(y=B*x1)*w+300)
++t}
きんぞ
@TakagiHitoshi
·
Jul 24
//#つぶやきProcessing #p5js
t=0
draw=_=>{
createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=0;i<W;i++)
translate(X=150*cos(T=(i+t)/W*TAU)**5+w,Y=150*sin(T)+w),
fill(abs(R=W*sin(X+Y)),w,w),
rotate(I=T*i/w),
rect(0,0,I%11*2),
resetMatrix()
++t}
Koma Tebe
@KomaTebe
·
Aug 31, 2022
I have written a two-part #tutorial on how to create a #つぶやきProcessing sketch and how to compress it to fit into one tweet. Part one is available now. The second part will be published in a day or two.
From link.medium.com
ntsutae
@ntsutae
·
Jun 18, 2020
#つぶやきProcessing #p5js
t=0
draw=_=>{t+=.5;createCanvas(720,405);background(0);stroke(255);scale(3)
for(y=0;y<135;y++)for(x=0;x<240;x++)
((x-(sin((t+x)/19)*2-cos((t-y)/17)*3))^x|y)%5||point(x,y)}
ひさだん
@hisadan
·
Jul 11
//#つぶやきProcessing
float i,x,y,n,k,t;
void setup(){
size(800,800);
colorMode(HSB);
}
void draw(){
background(0);
for(i=0;i<800;i++){
x=i/200;
k=(1-cos(t))/2;
for(n=0;n<99;n++){
y=x*k*(1-k);
stroke(n,255,255);
point(i,600-y*500);
k=y;
}
}
t+=PI/400;
}
Koma Tebe
@KomaTebe
·
Dec 22, 2023
f=0,draw=r=>{for(f||createCanvas(W=400,W,WEBGL),noStroke(background(0)),rotateX(.6),z=W;z--;)for(i=0;i<6;i+=.8)push(E=ellipse),translate(0,-150,-z),rotate(i+sin(z/200+f)),!z&&E(0,0,22,99),circle(0,.7*z,2),fill(125*sin(3*f+z/15)+125),pop(E(0,0,z/3,z));f-=.03};//#つぶやきProcessing
Koma Tebe
@KomaTebe
·
Dec 24, 2022
f=0,draw=o=>{for(f||createCanvas(W=400,W,WEBGL),background(0),y=0;y<W;y+=.5)x=sin(y+f)*y,stroke(N=200*noise(y+7*f),C=100*cos(y+f)+N,N),strokeWeight(C/20),point(x,2*y-100),stroke(W,x/22),line(0,-130,sin(T=noise(y+f/9)*TAU*2)*x*2,cos(T)*x*2-130);f+=.007};//#つぶやきProcessing #Xmas
Koma Tebe
@KomaTebe
·
Sep 3, 2024
#つぶやきProcessing
f=0,draw=e=>{for(f++||createCanvas(W=400,W),background(P=PI/128,99),t=r=200,noiseDetail(sin(f/W),.7),z=350;z>=0;z-=30)for(i=P;i<8*PI;i+=P)push(stroke(z)),translate(t,t),rotate(i+f/W),point(0,noise(sin(I=i*z+f/99)*r/9e4,cos(I)*r/9e4,z+f/99)*W),pop(r-=20);f+=.1}
Search filters
People
From anyone
People you follow
Location
Anywhere
Near you
Advanced search
Trending now
What’s happening
Motorsport · Trending
Cup Series
Motorsport · Trending
Corey Heim
Trending with #Brickyard400, #NASCAR
Trending
Philon
Arts & culture · Trending
Midjourney
Show more
Who to follow

    Paul Reed
    @Bball_paul
    Lip-Bu Tan
    @LipBuTan1
    Fabrizio Romano
    @FabrizioRomano

Show more
Terms
 ·
Privacy
 ·
Cookies
 ·
Accessibility
 ·
US TIDA
 ·
Ads Info
 ·
© 2026 X Corp.
きんぞ
@TakagiHitoshi
·
Jul 24
//#つぶやきProcessing #p5js
t=0
draw=_=>{
createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=t;i<W+t;i++)
translate(X=150*cos(T=i/w*TAU)+w,Y=150*sin(T)+w),
fill(['red','blue','yellow'][i%3]),
rotate((i+t)/41),
rect(0,0,57),
resetMatrix()
++t}
きんぞ
@TakagiHitoshi
·
Jul 25
//so much on this for now #つぶやきProcessing #p5js
t=0
draw=_=>{createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=0;i<W;i++)
translate(150*cos(T=(i+t)/W*TAU)+w,150*sin(T)+w),
fill(abs(R=W*sin(t/3-T)),w,w),
rotate(t/19),
rect(0,0,28),
resetMatrix()
++t}
きんぞ
@TakagiHitoshi
·
13h
//#つぶやきProcessing #p5js
t=0,B=-1,C=.5
setup=_=>{
for(i=0,X=[];i<100;i++)
X.push(random(-1,1))
}
draw=_=>{
t||createCanvas(W=(w=200)*2,W)
colorMode(HSB)
for(i=0,x=X[t%100],y=B*x;i<W*4;i++)
stroke((i/360+t)%360,w,w),
x1=x,
point((x=1+y-C*abs(x))*w+150,(y=B*x1)*w+300)
++t}
Akira
@akira2768922
·
Dec 26, 2021
#つぶやきProcessing
t=0
draw=_=>{t++||createCanvas(W=600,W,WEBGL)
lights(background(W))
T=translate
X=rotateX
Z=rotateZ
rotateY(Q=PI/2)
Z(.9)
for(j=26;j--;pop())
for(push(u=t/60%2)+T(0,98*(u-j+3))+X(j%2?0:2*Q),i=6;i--;T(0,49))box(1,97)+X(i%2?-Q:Q)+T(0,49)+Z(map(i-u+j,7,8,Q,0,1))}
きんぞ
@TakagiHitoshi
·
13h
Lozi Map
http://padyn.wikidot.com/lozi-maps

https://openprocessing.org/@TakagiHitoshi
/2984306

#p5js #つぶやきProcessing #openprocessing
Quote
きんぞ
@TakagiHitoshi
·
13h
//#つぶやきProcessing #p5js
t=0,B=-1,C=.5
setup=_=>{
for(i=0,X=[];i<100;i++)
X.push(random(-1,1))
}
draw=_=>{
t||createCanvas(W=(w=200)*2,W)
colorMode(HSB)
for(i=0,x=X[t%100],y=B*x;i<W*4;i++)
stroke((i/360+t)%360,w,w),
x1=x,
point((x=1+y-C*abs(x))*w+150,(y=B*x1)*w+300)
++t}

t=0
draw=_=>{
createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=0;i<W;i++)
translate(X=150*cos(T=(i+t)/W*TAU)+w,Y=150*sin(T*3)+w),
fill(abs(R=W*sin(X+Y)),w,w),
rotate((t*i)/W),
rect(0,0,30),
resetMatrix()
++t}
きんぞ
@TakagiHitoshi
·
Jul 25
//#つぶやきProcessing #p5js
t=0
draw=_=>{
createCanvas(W=(w=200)*2,W)
colorMode(HSB)
rectMode(CENTER)
noStroke()
for(i=0;i<W;i++)
translate(X=150*cos(T=(i+t)/W*TAU)+w,Y=150*sin(T)+w),
fill(abs(R=W*sin(X+Y)),w,w),
rotate(T*2.7-t/9),
rect(0,0,37),
resetMatrix()
++t}
ア
@yuruyurau
·
Nov 18, 2024
t=0,draw=$=>{t||createCanvas(w=400,w);background(6).stroke(255,66);for(t+=PI/60,y=99;y<300;y+=3)for(x=99;++x<300;)o=mag(k=x/8-25,e=y/8-25)/4,point((q=x+y/3+k/cos(y/8)+1/k+o*k*cos(y/8-t)*sin(o*4-t))/3*atan(2*sin(c=o*e/50-t/8))+200,(y*tan(c)+q)/3*cos(c)+200)}
//#つぶやきProcessing
きんぞ
@TakagiHitoshi
·
Jul 25
//#つぶやきProcessing #p5js
t=0
draw=_=>{
C=circle
createCanvas(W=(w=200)*2,W)
for(x=-w;x<w;x++)
point(x+w,x*x/w*1.5),
point(x+w,280-(x*x*(x-w)*(x+w))/W/W/29)
C(130,130,50)
C(270,130,50)
fill(random()<.1?0:W)
quad(160,w,w,160,240,w,w,240)
fill(0)
C(130,130,30)
C(270,130,30)
++t}
Quote
きんぞ
@TakagiHitoshi
·
Jul 25
Image
//#つぶやきProcessing #p5js
t=0
draw=_=>{
createCanvas(W=(w=200)*2,W)
for(x=-w;x<w;x++)
point(x+w,x*x/w*1.5),
point(x+w,280-(x*x*(x-w)*(x+w))/W/W/29)
circle(130,130,50)
circle(270,130,50)
fill(0)
circle(130,130,30)
circle(270,130,30)
quad(160,w,w,160,240,w,w,240)
++t}
/ナフサ不足の夏 #つぶやきProcessing #p5js
preload=_=>{i=loadImage('shibuya.png')}
t=0
draw=_=>{
noLoop()
createCanvas(W=i.width,H=i.height*2)
colorMode(HSB)
image(i,0,0)
for(x=0;x<W;x++)
for(y=0;y<H/2;y++)
C=i.get(x,y),
stroke(hue(C),0,brightness(C)),
point(x,y+H/2)
++t}
Image
ア
@yuruyurau
·
Jul 24
a=(y,d=mag(k=(y<7?8+sin(y^9)*6:4+cos(y))*cos(i+t/2),e=y/2-13))=>point((q=y*k/5*(2+sin(d*2+y-t*4))+80)*cos(c=d/4-t/2+i%2*3)*cos(c/2+e/8)+200,q*d/8*sin(c)+200)
t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,116);for(t+=PI/90,i=1e4;i--;)a(i/790)}//#つぶやきProcessing
0:00 / 0:12
ア
@yuruyurau
·
Sep 13, 2025
a=(y,d=mag(k=(y<5?6+sin(y^1)*6:4+cos(y))*cos(i+t/4),e=y/3-13)+sin(e/4-t)/3)=>point((q=y*k/5*(2+sin(d*2+y-t*4)))+90*cos(c=d/3-t/2+i%2)+200,q*sin(c)+d*29-170)
t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/90,i=1e4;i--;)a(i/790)}//#つぶやきProcessing
0:00 / 0:12
ア
@yuruyurau
·
Oct 12, 2024
a=(x,y,d=5*cos(o=mag(k=x/8-25,e=y/8-25)/3))=>[(q=x/2+k/atan(9*cos(e))*sin(d*4-t))*sin(c=d/3-t/8)+200,(y/3+d+q)/2*cos(c)+200]
t=0,draw=$=>{t||createCanvas(w=400,w);background(6,19);for(t+=PI/60,y=99;++y<300;)for(x=99;++x<300;stroke(x,y,y+x,36))point(...a(x,y))}
#つぶやきProcessing
ア
@yuruyurau
·
Jun 13, 2025
a=(x,y,d=mag(k=4*cos(x/29),e=y/7-13))=>point((q=3*sin(atan2(k,e)*19)+sin(y/19)*k*(9+2*sin(e*9-d*3+t/4)))+60*cos(c=d-t/8)+200,q*sin(c)+d*39-195)
t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,146);for(t+=PI/15,i=1e4;i--;)a(i,i/235)}//#つぶやきProcessing
ア
@yuruyurau
·
May 9
t=0,d=5e-4,draw=_=>{t++||createCanvas(w=400,w);background(9).stroke(w,96);for(x=y=z=9,i=3e4;i--;point((q=x*(e=sin(t*PI/20-x*x/99+i%9)+1)+89)*cos(k=z/59-e/29+t*PI/480+i%9*8)+200,200-(q+60*cos(k/2))*sin(k)))[x,y,z]=[x+9*(y-x)*d,y+(x*(28-z)-y)*d,z+(x*y-z-z)*d]}//#つぶやきProcessing
ア
@yuruyurau
·
Oct 12, 2025
t=0,a=.003,b=.06,u=-.8,n=_=>y+(1-b*y*y)*a*y+(f=x=>u*x+2*(1-u)*x*x/(1+x*x))(x)
draw=_=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/45,x=y=1,i=4e4;i--;point(y*(5*sin(c=t-mag(x,y)/4)+11)+205,x*(2*cos(c)+7)+9*sin(y/4+t)+185))[x,y]=[n(),f(n())-x]}#つぶやきProcessing
0:00 / 0:06
Koma Tebe
@KomaTebe
·
Sep 17, 2022
function draw(){for(f||(createCanvas(W=400,W,WEBGL),g=createGraphics(W,W).background(0).rect(0,0,200,W)),background(170),texture(g),i=0;i<TAU;i+=PI/32)C(130),C(-160);f+=PI/64}f=0,C=r=>{push(),rotate(i),translate(r,0),rotateY(16*i+f),pop(cylinder(4,r/12,W))};//#つぶやきProcessing
0:00 / 0:53
Koma Tebe
@KomaTebe
·
Jul 8, 2024
f=0,draw=a=>{for(f||createCanvas(W=400,W,WEBGL),background(d=PI/80),S=sin,C=cos,T=TAU,u=0;u<=PI;u+=d)for(v=0;v<=PI;v+=d)F=f/T,V=v+F%d,U=u-F%d,P=atan(S(S(V*U))+f)+158.4,X=P*C(U)*S(V),Y=P*S(U)*S(V),Z=P*tan(U-V+F),stroke(4*Y),point(X,Z/2,Y);f+=.03};//#つぶやきProcessing #generative
zadgy5534
@sxolastikos
·
18h
t=0,setup=_=>{createCanvas(w=400, w, WEBGL)}
draw=_=>{background(220),t+=.01
for(i=w;i>0;i-=4){push(),strokeWeight(w/i)
for(j=TAU;j>0;j-=PI/4,"#つぶやきProcessing #p5js"){
stroke(w/i/j),point(0,i/cos(t/j)*sin(j),0)}pop()
}} // Ups and Downs
きんぞ
@TakagiHitoshi
·
Jul 23
酷暑で溶けるモンドリアン
Mondrian melting in the scorching summer
https://openprocessing.org/@TakagiHitoshi
/2983507

#つぶやきProcessing #p5js
Quote
きんぞ
@TakagiHitoshi
·
Jul 23
//#つぶやきProcessing #p5js
setup=_=>{r=random
createCanvas(W=(w=200)*2,W)
noStroke()
for(i=0;i<40;i++)fill(r(['red','blue','yellow'])),rect(r(W),r(W),r(w))}
draw=_=>{for(x=0;x<W;x++)for(y=0;y<W;y++)c=get(x,y),d=get(X=x+r(-2,2),Y=y+r(-1,8)),stroke(c),strokeWeight(1.2),point(X,Y)}


Top
Latest
People
Media
Lists
Search timeline
ア
@yuruyurau
·
Jul 25
a=(y,d=mag(k=(4+cos(i/9-t*2))*cos(i/35),e=y/7-13)+sin(e/9+t/2)-4)=>point((q=2*sin(k*3)-y/35*k*(9+k*sin(cos(e)*9-d*2+t)))+40*cos(c=d-t)+200,q*sin(c)+d*35)
t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/80,i=1e4;i--;)a(i/235)}//#つぶやきProcessing
はぅ君
@Hau_kun
·
Aug 6, 2025
t=0
$=[]
draw=_=>{background(0,t?9:!createCanvas(W=720,W)+W)
filter(BLUR)
stroke(W)
for(i=9;i--;)$[t++%(W*9)]={x:t*99%W,y:0,g:0,s:3}
$.map(p=>strokeWeight(p.s*=.997)+point(p.x+=(N=noise(p.x/W,p.y/9,t/W))>.4?0:(N%.1>.05?1:-1)+(p.g=0),p.y+=N>.4?p.g+=.5:.5))}
#つぶやきProcessing
0:01 / 1:01
ひさだん
@hisadan
·
Jul 16, 2025
//#つぶやきProcessing
float n=1,t,r;
void setup(){
  size(800,800);
}
void draw(){
  background(0);
  stroke(255,255-t*2,255-t*5,256-t*3);
  translate(400,400);
  for(r=0;r<TAU;r+=PI/n)
    line(n*sin(r*t),n*cos(r*t),(400-n)*sin(r),(400-n)*cos(r));
  t+=.05;
  n+=.5;
}
0:00 / 0:53
Koma Tebe
@KomaTebe
·
Feb 21, 2022
#つぶやきProcessing
function draw(){for(z||createCanvas(w=400,w,WEBGL),background(W=200),circle(0,0,X),rotateX(.5),i=9*-w;i<w;i+=W)push(x=-x),noFill(translate(x,90,i+z%w)),cone(50,-W,5,5),line(30,X,-30,X),C(20),pop(C(-20));z++}z=0,x=X=-80,C=a=>curve(x,-w,0,a,X,0,a-2*x,X,W,x,-w,w)
𝐧𝐚𝐠𝐚𝐲𝐚𝐦𝐚
@nagayama
·
Oct 9, 2021
t=0
draw=_=>{t||createCanvas(W=600,W,WEBGL)
background(0)
p=PI/40
noStroke`#つぶやきProcessing`
rotateX(.5)
rotateY(-.5)
r=90
for(y=40;y--;)for(x=80;x--;pop(sphere(cos(v)+.3)))push(),translate((2+sin(v=(y+t)*p*2))*cos(u=(x+t)*p)*r,(2+sin(v))*sin(u)*r,z=cos(v)*r)
t=(t+.02)%1}
ひさだん
@hisadan
·
Dec 19, 2022
//#つぶやきProcessing
float k=9,f=.995;void setup(){size(800,800);}void draw(){clear();stroke(-1,99);a(400,400,99);k*=f;}void a(float x,float y,float d){if(d>10){for(float r=-PI/2;r<=PI/2;r+=PI/3){push();translate(x,y);rotate(r/sqrt(k));line(0,0,0,-d);a(0,-d,d/1.4);pop();}}}
0:00 / 0:48
