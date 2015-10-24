#!/usr/bin/python

import json

with open("../data/tex.json", "r") as f:
	tex = json.loads(f.read())

SCALE = 1
for frame in tex["frames"]:
	frame["frame"]["x"] *= SCALE
	frame["frame"]["y"] *= SCALE
	frame["frame"]["w"] *= SCALE
	frame["frame"]["h"] *= SCALE
	frame["spriteSourceSize"]["x"] *= SCALE
	frame["spriteSourceSize"]["y"] *= SCALE
	frame["spriteSourceSize"]["w"] *= SCALE
	frame["spriteSourceSize"]["h"] *= SCALE
	frame["sourceSize"]["w"] *= SCALE
	frame["sourceSize"]["h"] *= SCALE

with open("../data/tex.json", "w") as f:
	f.write(json.dumps(tex).replace("}},", "}},\n").replace("}}],", "}}],\n"))
