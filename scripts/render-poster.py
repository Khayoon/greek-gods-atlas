from PIL import Image, ImageDraw, ImageFont, ImageChops
import json, math, textwrap
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'
W,H=3200,4000
S=2
PAPER='#f5f0e4'; INK='#263d33'; MUTED='#6d7566'; LAND='#e9e4d5'; COAST='#68715e'; GOLD='#e7b84e'; RUST='#a0523b'; BLUE='#496c75'
im=Image.new('RGB',(W*S,H*S),PAPER)
d=ImageDraw.Draw(im)
fontdir=OUT/'atlas'/'vendor'
FONT={'serif':fontdir/'GentiumPlus-Regular.ttf','bold':fontdir/'GentiumPlus-Bold.ttf','sans':Path('C:/Windows/Fonts/segoeui.ttf'),'sansbold':Path('C:/Windows/Fonts/segoeuib.ttf')}
cache={}
def font(size,kind='sans'):
    k=(size,kind)
    if k not in cache: cache[k]=ImageFont.truetype(str(FONT[kind]),round(size*S))
    return cache[k]
def text(x,y,string,size=40,kind='sans',fill=INK,anchor='lt'):
    d.text((int(x*S),int(y*S)),string,font=font(size,kind),fill=fill,anchor=anchor,stroke_width=round(4*S) if 29<=size<=80 else 0,stroke_fill=PAPER)
def line(pts,fill=COAST,width=2):
    d.line([(int(x*S),int(y*S)) for x,y in pts],fill=fill,width=max(1,round(width*S)),joint='curve')
def ellipse(box,fill=None,outline=None,width=1):
    d.ellipse(tuple(round(a*S) for a in box),fill=fill,outline=outline,width=round(width*S))
def rect(box,fill,outline=None,width=1):
    d.rectangle(tuple(round(a*S) for a in box),fill=fill,outline=outline,width=round(width*S))
def poly(pts,fill,outline=None,width=1):
    d.polygon([(round(x*S),round(y*S)) for x,y in pts],fill=fill)
    if outline:line(pts+[pts[0]],outline,width)
def wrapped(x,y,string,width,size=36,kind='sans',fill=MUTED,leading=1.25):
    words=string.split(); rows=[]; current=''
    for word in words:
        candidate=(current+' '+word).strip()
        if current and d.textlength(candidate,font=font(size,kind))>width*S:
            rows.append(current);current=word
        else:current=candidate
    if current:rows.append(current)
    for i,row in enumerate(rows):text(x,y+i*size*leading,row,size,kind,fill)
    return y+len(rows)*size*leading

# The regular dotted ground is an intentional echo of the supplied reference.
for y in range(22,H,37):
    for x in range(22,W,37):ellipse((x-1.7,y-1.7,x+1.7,y+1.7),fill='#d9d2c2')

text(165,82,'A GEOGRAPHY OF GREEK MYTH',31,'sansbold',MUTED)
text(150,155,'Where were',204,'bold')
text(150,355,'the gods born?',204,'bold')
text(166,615,'Birthplaces and divine beginnings,',55,'serif')
text(166,683,'as told by ancient poets and local traditions.',55,'serif')
text(2865,165,'GREEK',48,'sansbold',anchor='mt')
text(2865,225,'MYTH',48,'sansbold',anchor='mt')
text(2865,285,'ATLAS',48,'sansbold',anchor='mt')
line([(2730,362),(3000,362)],INK,2)
text(2865,393,'GODS • GODDESSES',24,'sans',MUTED,anchor='mt')
text(2865,431,'& DEIFIED HEROES',24,'sans',MUTED,anchor='mt')

# Mercator projection; actual coastlines, no modern political borders.
SCALE=9500
X0,Y0=165,935
LON0,LATTOP=18.0,41.8
def merc(lat):return math.log(math.tan(math.pi/4+math.radians(lat)/2))
def project(lon,lat):return X0+SCALE*math.radians(lon-LON0),Y0+SCALE*(merc(LATTOP)-merc(lat))
map_bounds=(135,925,3075,2990)
map_layer=Image.new('RGBA',(W*S,H*S),(0,0,0,0)); md=ImageDraw.Draw(map_layer)
land=json.loads((OUT/'atlas'/'data'/'land.geojson').read_text('utf-8'))
for feature in land['features']:
    geom=feature['geometry']
    polygons=geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']]
    for rings in polygons:
        ring=rings[0]
        xs=[p[0] for p in ring];ys=[p[1] for p in ring]
        if max(xs)<18 or min(xs)>35.6 or max(ys)<31.7 or min(ys)>41.8:continue
        pts=[tuple(round(z*S) for z in project(lon,max(-85,min(85,lat)))) for lon,lat,*_ in ring]
        md.polygon(pts,fill=LAND)
        md.line(pts,fill=COAST,width=round(2.8*S),joint='curve')
        for hole in rings[1:]:
            hp=[tuple(round(z*S) for z in project(lon,lat)) for lon,lat,*_ in hole]
            md.polygon(hp,fill=PAPER)
            md.line(hp,fill=COAST,width=round(1.5*S))
crop=map_layer.crop(tuple(round(c*S) for c in map_bounds))
# Soften the edges of the geographic window instead of leaving a hard rectangular cut.
cw,ch=crop.size
fade_y=Image.new('L',(cw,ch),255);fd=ImageDraw.Draw(fade_y)
for a in range(125*S):
    opacity=round(255*a/(125*S))
    fd.line([(0,a),(cw,a)],fill=opacity)
    fd.line([(0,ch-1-a),(cw,ch-1-a)],fill=opacity)
fade_x=Image.new('L',(cw,ch),255);fd=ImageDraw.Draw(fade_x)
for a in range(45*S):
    opacity=round(255*a/(45*S))
    fd.line([(a,0),(a,ch)],fill=opacity)
    fd.line([(cw-1-a,0),(cw-1-a,ch)],fill=opacity)
crop.putalpha(ImageChops.multiply(crop.getchannel('A'),ImageChops.multiply(fade_x,fade_y)))
im.paste(crop,(round(map_bounds[0]*S),round(map_bounds[1]*S)),crop)
del md,map_layer,crop,fade_x,fade_y,fd
d=ImageDraw.Draw(im)

# Geographic names remain subordinate to the mythic callouts.
for name,lon,lat,size in [('G R E E C E',21.7,39.15,32),('A N A T O L I A',31.0,40.05,34),('C R E T E',24.2,35.10,29),('C Y P R U S',33.25,35.35,27),('L I B Y A',23.3,32.1,29)]:
    x,y=project(lon,lat);text(x,y,name,size,'sans',MUTED,anchor='mm')
x,y=project(27.4,33.8);text(x,y,'Mediterranean Sea',48,'serif','#879086',anchor='mm')

# Compass.
cx,cy=2945,1025
poly([(cx,cy-40),(cx+10,cy),(cx,cy+33),(cx-10,cy)],PAPER,COAST,2)
poly([(cx,cy-40),(cx+10,cy),(cx,cy)],COAST)
line([(cx-27,cy),(cx+27,cy)],COAST,1.5)
text(cx,cy-65,'N',28,'serif',COAST,anchor='mm')

def marker(lon,lat,kind='birth',r=12):
    x,y=project(lon,lat)
    if kind=='birth':ellipse((x-r,y-r,x+r,y+r),GOLD,INK,3)
    elif kind=='rival':
        ellipse((x-r-5,y-r-5,x+r+5,y+r+5),PAPER,RUST,2.5)
        ellipse((x-5,y-5,x+5,y+5),RUST)
    elif kind=='related':poly([(x,y-r),(x+r,y),(x,y+r),(x-r,y)],BLUE,PAPER,2)
    elif kind=='regional':
        ellipse((x-22,y-22,x+22,y+22),None,'#a8a387',2)
        ellipse((x-7,y-7,x+7,y+7),GOLD,INK,2)
    return x,y

def leader(point,end,via=None,fill=COAST):
    x,y=point;ex,ey=end
    points=[(x,y)]+(via or [])+[(ex,ey)]
    # draw a smoothed quadratic curve through the elbow for calmer callouts
    if via:
        line(points,fill,2)
    else:
        mx=(x+ex)/2
        q=[]
        for i in range(51):
            t=i/50
            q.append(((1-t)**2*x+2*(1-t)*t*mx+t*t*ex,(1-t)**2*y+2*(1-t)*t*ey+t*t*ey))
        line(q,fill,2)

boxes=[]
def label(x,y,name,place,note=None,ref='',width=650,size=67,align='left'):
    # Label blocks are explicitly placed in open space, independent of coordinates.
    # Small text halos preserve the map's coastlines beneath the callouts.
    name_text=name
    lines=name_text.split('\n')
    height=len(lines)*size*1.03+56+(45*len((note or '').split('\n')) if note else 0)
    yy=y
    for row in lines:
        text(x,yy,row,size,'bold'); yy+=size*1.03
    if ref:text(x+min(width-35,d.textlength(lines[-1],font=font(size,'bold'))/S)+13,yy-size*.97,ref,25,'sansbold',RUST)
    text(x,yy+4,place,42,'sansbold'); yy+=58
    if note:
        for row in note.split('\n'):text(x,yy,row,33,'sans',MUTED);yy+=43
    boxes.append((name,x,y,width,yy-y))
    return yy

# Callout lines are drawn first. Markers and labels are added above them.
sites={
 'muses':(22.42,40.20),'thebes':(23.318,38.322),'hermes':(22.396,38.026),
 'pan':(22.15,37.81),'athena':(21.90,37.52),'lycaeus':(21.98,37.46),
 'poseidon':(22.40,37.62),'asclepius':(23.07,37.61),'dioscuri':(22.13,36.79),
 'delos':(25.269,37.392),'samos':(26.885,37.673),'ortygia':(27.34,37.95),
 'zeus':(25.49,35.16),'eileithyia':(25.225,35.328),'aphrodite':(32.414,34.755),
 'cythera':(22.99,36.26),'aristaeus':(21.86,32.82),'tr icca':(21.77,39.55)
}
def p(key):return project(*sites[key])
leaders=[
 ('muses',(900,1125)),('thebes',(1145,1450)),('hermes',(658,1453)),
 ('pan',(630,1636)),('athena',(626,1835)),('lycaeus',(625,2040)),
 ('dioscuri',(670,2250)),('poseidon',(1120,2100)),('asclepius',(1255,1640)),
 ('delos',(1600,1950)),('samos',(1840,1730)),('ortygia',(2120,1515)),
 ('zeus',(1620,2420)),('eileithyia',(1230,2605)),('aphrodite',(2440,2540)),
 ('aristaeus',(670,2820))
]
for key,end in leaders:leader(p(key),end)

# The principal stories and the important competing local claims.
label(390,975,'The nine Muses','Pieria, near Olympus','Daughters of Zeus and Mnemosyne',ref='10',width=900,size=68)
label(1145,1270,'Dionysus & Heracles','Thebes','Semele’s son; Alcmene’s deified son',ref='5',width=1070,size=67)
label(205,1350,'Hermes','Mount Cyllene, Arcadia','Born in a mountain cave',ref='3',width=470,size=68)
label(205,1555,'Pan','Arcadia, near Cyllene','A regional mountain tradition',ref='7',width=455,size=68)
label(205,1760,'Athena','Aliphera, Arcadia','Local claim to her head-birth',ref='6',width=475,size=68)
label(205,1970,'Zeus — rival claim','Mount Lycaeus, Arcadia',ref='1',width=550,size=59)
label(205,2175,'Castor & Polydeuces','Pephnos, off the Mani coast','The divine twins, or Dioscuri',ref='13',width=660,size=62)
label(1120,2050,'Poseidon','Near Mantineia, Arcadia','Hidden here after birth',ref='8',width=690,size=66)
label(1255,1530,'Asclepius','Epidaurian territory','Apollo’s son, god of healing',ref='11',width=700,size=68)
label(1635,1850,'Apollo & Artemis','Delos','Both born here in Apollodorus',ref='4',width=910,size=68)
label(1840,1630,'Hera','Samos, beside the Imbrasus','The Samian birth tradition',ref='2',width=680,size=68)
label(2120,1410,'Apollo & Artemis','Ortygia, near Ephesus','A rival local birth tradition',ref='4',width=850,size=62)
label(1620,2350,'Zeus','Dicte, Crete','Rhea’s secret Cretan birth',ref='1',width=690,size=74)
label(1000,2560,'Eileithyia','Amnisos, Crete','The childbirth goddess',ref='12',width=610,size=66)
label(2420,2490,'Aphrodite','Paphos, Cyprus','Sea-born; a landing tradition',ref='9',width=660,size=68)
label(205,2750,'Aristaeus','Libya, near Cyrene','Divine patron of rural crafts',ref='16',width=740,size=68)

# Marks sit over land and the leader lines; positions are geographical, not label anchors.
for key in ['thebes','hermes','athena','asclepius','dioscuri','delos','samos','zeus','eileithyia']:
    marker(*sites[key])
for key in ['lycaeus','ortygia']:marker(*sites[key],'rival')
for key in ['poseidon','aphrodite']:marker(*sites[key],'related')
for key in ['pan','aristaeus','muses']:marker(*sites[key],'regional')

# Specific ancient Cretan names without invented modern town coordinates.
rect((1850,2740,3070,2960),PAPER)
text(1880,2748,'MORE CRETAN BIRTH TRADITIONS',27,'sansbold',MUTED)
text(1880,2800,'Britomartis / Dictynna',48,'bold')
text(2460,2805,'Caeno¹⁴',36,'sansbold')
text(1880,2864,'Plutus',48,'bold')
text(2090,2871,'Tripolus¹⁵ — god of wealth',36,'sansbold')
text(1880,2923,'Ancient town locations uncertain; no precise pins.',29,'sans',MUTED)
line([(1850,2725),(3070,2725)],'#bbc1ac',1.5)

# A genuinely informative unmapped strip, rather than false location assignments.
line([(160,3065),(3040,3065)],INK,2)
text(165,3100,'BEYOND THE PINS',29,'sansbold',MUTED)
text(165,3160,'No fixed location in the cited birth accounts¹⁸',46,'bold')
text(165,3230,'Ares · Demeter · Hades · Hephaestus · Hestia · Persephone',39,'sans')
text(165,3293,'Leto¹⁷',44,'bold')
text(340,3300,'Hyperborea — a mythical northern island, left unplotted.',36,'sans',MUTED)
text(165,3363,'THE NINE MUSES',26,'sansbold',MUTED)
text(165,3410,'Calliope · Clio · Erato · Euterpe · Melpomene · Polyhymnia · Terpsichore · Thalia · Urania',34,'serif')

# Legend on a single line, styled as in the reference rather than as website controls.
key_y=3518
ellipse((175,key_y-13,201,key_y+13),GOLD,INK,3)
text(220,key_y,'Birth tradition',33,'sansbold',anchor='lm')
ellipse((650,key_y-15,680,key_y+15),PAPER,RUST,2.5)
ellipse((660,key_y-5,670,key_y+5),RUST)
text(698,key_y,'Rival claim',33,'sansbold',anchor='lm')
poly([(1110,key_y-15),(1125,key_y),(1110,key_y+15),(1095,key_y)],BLUE)
text(1145,key_y,'Arrival / infancy',33,'sansbold',anchor='lm')
ellipse((1677,key_y-18,1713,key_y+18),None,'#a8a387',2)
ellipse((1689,key_y-6,1701,key_y+6),GOLD,INK,1.5)
text(1735,key_y,'Broad regional setting',33,'sansbold',anchor='lm')
text(165,3585,'Traditions, not historical birth records. Named places are approximate; rival accounts coexist.',33,'serif',MUTED)

# Compact, readable source key retained inside the image itself.
line([(160,3657),(3040,3657)],'#b5b9a8',1.5)
text(165,3685,'ANCIENT SOURCE KEY',24,'sansbold',MUTED)
sourcecols=[
 ['1  Apollodorus 1.1.6–7; Pausanias 8.36.3',
  '2  Pausanias 7.4.4     3  Homeric Hymn 4.1–29',
  '4  Apollodorus 1.4.1; Strabo 14.1.20',
  '5  Bacchae 1–12; Homeric Hymn 15.1–9',
  '6  Pausanias 8.26.6     7  Homeric Hymn 19.27–47',
  '8  Pausanias 8.8.1–4'],
 ['9  Hesiod, Theogony 188–206; Nonnus 13.435 ff.',
  '10  Hesiod, Theogony 53–79',
  '11  Pausanias 2.26.3–5     12  Pausanias 1.18.5',
  '13  Pausanias 3.26.2     14  Diodorus 5.76.3',
  '15  Diodorus 5.77.1–2     16  Diodorus 4.81.1–3',
  '17  Diodorus 2.47.1–2'],
 ['18  Hesiod, Theogony 453–467, 912–914, 921–923;',
  '      Apollodorus 1.3.5 (Hephaestus)',
  'Primary texts via Theoi.com and LacusCurtius.',
  'Coastlines: Natural Earth, 1:50m; modern geography.',
  'Tiny islands may be smaller than their markers.',
  'Pan, Aristaeus and the Muses use regional markers.']
]
for col,rows in enumerate(sourcecols):
    for i,row in enumerate(rows):text(165+col*985,3734+i*34,row,25,'sans',MUTED)

# Source-provenance sidecar stays in work; the requested deliverable is just the PNG.
im=im.resize((W,H),Image.Resampling.LANCZOS)
destination=OUT/'greek-gods-birthplaces.png'
im.save(destination,optimize=True,dpi=(300,300))
# Layout rectangles are retained in memory for debugging.
print(f'Saved {destination} ({W} x {H})')
