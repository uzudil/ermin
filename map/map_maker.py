#!/usr/bin/python
from PIL import Image, ImageChops, ImageColor
import json, re


TILE = 8

PALETTE = {
	"black":              ImageColor.getrgb("#000000"),
	"black_bright":       ImageColor.getrgb("#000000"),
	"blue":               ImageColor.getrgb("#0088bb"),
	"blue_bright":        ImageColor.getrgb("#0055dd"),
	"red":                ImageColor.getrgb("#bb0000"),
	"red_bright":         ImageColor.getrgb("#ff0000"),
	"purple":             ImageColor.getrgb("#bb00bb"),
	"purple_bright":      ImageColor.getrgb("#ff00ff"),
	"green":              ImageColor.getrgb("#00bb00"),
	"green_bright":       ImageColor.getrgb("#00ff00"),
	"turquoise":          ImageColor.getrgb("#00bbbb"),
	"turquoise_bright":   ImageColor.getrgb("#00ffff"),
	"yellow":             ImageColor.getrgb("#bbbb00"),
	"yellow_bright":      ImageColor.getrgb("#ffff00"),
	"white":              ImageColor.getrgb("#bbbbbb"),
	"white_bright":       ImageColor.getrgb("#ffffff"),
	"orange":              ImageColor.getrgb("#bb9900"),
	"orange_bright":       ImageColor.getrgb("#ffcc00")
}

class MapMaker():

	def __init__(self):
		self.tex_img = Image.open("../data/tex.png")
		with open("../data/tex.json", "r") as f:
			self.tex = json.loads(f.read())

		with open("../src/rooms.js", "r") as f:
			rooms_src = f.read()
		m = re.match("^.*?WORLD = (\{.*?\});", rooms_src, re.DOTALL)
		self.world = json.loads(m.group(1))

		with open("../src/textures.js", "r") as f:
			tex_src = f.read()
		m = re.match("^.*?BLOCKS = (\[.*?\]);", tex_src, re.DOTALL)
		self.blocks = json.loads(m.group(1))

		self.frames = {}
		for frame in self.tex["frames"]:
			f = frame["frame"]
			x = f["x"]
			y = f["y"]
			w = f["w"]
			h = f["h"]
			box = (x, y, x + w, y + h,)
			self.frames[frame["filename"]] = self.tex_img.crop(box).resize((w * TILE / 16, h * TILE / 16,), Image.ANTIALIAS)

	def draw_map(self):
		room = "start"
		w, h = self.measure_world(room)
		w += 1
		h += 1
		print "world size=%d x %d" % (w, h)
		start = self.load_room(room)
		rw = TILE * len(start)
		rh = TILE * len(start[0])
		print "room size=%d x %d" % (rw, rh)
		map_width = w * rw
		map_height = h * rh
		print "- Creating map of size: %d x %d" % (map_width, map_height)
		out = Image.new("RGBA", (map_width, map_height), "black")
		self.draw_room(out, room, rw, rh)
		out.save("../data/map.png")

	def measure_world(self, room, x=0, y=0, w=0, h=0, seen_rooms=None):
		if not seen_rooms:
			seen_rooms = set([])
		if not room in seen_rooms:
			seen_rooms.add(room)

			if x > w:
				w = x
			if y > h:
				h = y
			world_rec = self.world[room]
			if world_rec[0]:
				w, h = self.measure_world(world_rec[0], x - 1, y, w, h, seen_rooms)
			if world_rec[1]:
				w, h = self.measure_world(world_rec[1], x + 1, y, w, h, seen_rooms)
			if world_rec[2]:
				w, h = self.measure_world(world_rec[2], x, y - 1, w, h, seen_rooms)
			if world_rec[3]:
				w, h = self.measure_world(world_rec[3], x, y + 1, w, h, seen_rooms)

		return w, h

	def load_room(self, room):
		with open("../data/rooms/%s.json" % room) as f:
			return json.loads(f.read())

	def tint_image(self, image, tint_color):
		return ImageChops.multiply(image, Image.new('RGBA', image.size, tint_color))

	def draw_room(self, out, room, rw, rh, x=0, y=0, seen_rooms=None, old_room=None, dir=None):
		if not seen_rooms:
			seen_rooms = set([])
		if not room in seen_rooms:
			seen_rooms.add(room)
			room_data = self.load_room(room)

			# print "Drawing room %s at %d,%d (%d,%d) - from: %s - %s" % (room, x, y, (x * rw), (y * rh), old_room, dir)
			for xp, col in enumerate(room_data):
				for yp, value in enumerate(col):
					if value > 0:
						block = self.blocks[value]
						frame = self.frames[block[1]]
						out.paste(self.tint_image(frame, PALETTE[block[0]]), box=(x * rw + xp * TILE, y * rh + yp * TILE, ), mask=frame)

			world_rec = self.world[room]
			if world_rec[0]:
				self.draw_room(out, world_rec[0], rw, rh, x - 1, y, seen_rooms, room, "left")
			if world_rec[1]:
				self.draw_room(out, world_rec[1], rw, rh, x + 1, y, seen_rooms, room, "right")
			if world_rec[2]:
				self.draw_room(out, world_rec[2], rw, rh, x, y - 1, seen_rooms, room, "up")
			if world_rec[3]:
				self.draw_room(out, world_rec[3], rw, rh, x, y + 1, seen_rooms, room, "down")


MapMaker().draw_map()
