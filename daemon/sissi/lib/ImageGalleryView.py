import Base
import time
import os
import re
import appuifw
import key_codes
import e32
import graphics

class ImageGalleryView(Base.View):
#class ImageGalleryView:

    def __init__(self, parent):
        Base.View.__init__(self, parent)
        self.active = False
        # TODO: create way to change these
        # TODO: put these to Main.config
        self.tags = [u"animals",u"architecture",u"nature",u"object",u"people",u"traffic",u"view"]
        self.visibilities = [u"PUBLIC",u"RESTRICTED:community",u"RESTRICTED:friends",u"RESTRICTED:family",u"PRIVATE"]
        self.extensions = ["jpg", "png"]
        self.directories = ["C:\\Data\\Images", "E:\\Images"]
        # Other stuff
        self.updating = False
        self.current_img = -1
        self.image_metadatafile = os.path.join(self.Main.datadir, "imagedata.txt")
        self.IMG_LIST = [] # Contains the metadata all images found
        self.IMG_NEW_LIST = [] # Contains 
        self.IMG_NAMES = {}
        #self.extensions = ["jpg", "mp4", "3gp", "wav", "amr"]
        self.p_ext = re.compile(r"\.("+"|".join(self.extensions)+")$", re.IGNORECASE)
        self.gmtime = time.time() + time.altzone # FIXME: altzone is broken (finland, normaltime, elisa)

    def start_sync(self):
        self.t.after(0.1, self.sync_server)
        
    def activate(self):
        #Base.View.activate(self)
        #appuifw.app.screen = "large"
        self.t = e32.Ao_timer()
        self.current_img = -1
        appuifw.app.exit_key_handler = self.handle_close
        self.imagemenu = []
        self.canvas = appuifw.Canvas(redraw_callback=self.update)
        self.canvas.bind(key_codes.EKeyLeftArrow,lambda: self.next_image(-1))
        self.canvas.bind(key_codes.EKeyRightArrow,lambda: self.next_image(1))
        self.canvas.bind(key_codes.EKeyUpArrow,lambda: self.next_image(0))
        self.canvas.bind(key_codes.EKey0,lambda: self.start_sync())
        self.imagemenu.append((u"0. Synchronize", lambda: self.start_sync()))
        self.canvas.bind(key_codes.EKey1,lambda: self.ask_caption())
        self.imagemenu.append((u"1. Caption", lambda: self.ask_caption()))
        self.canvas.bind(key_codes.EKey2,lambda: self.ask_tags())
        self.imagemenu.append((u"2. Tags", lambda: self.ask_tags()))
        self.canvas.bind(key_codes.EKey3,lambda: self.toggle_visibility())
        self.imagemenu.append((u"3. Visibility", lambda: self.toggle_visibility()))
        self.canvas.bind(key_codes.EKeyBackspace,lambda: self.delete_current())
        self.imagemenu.append((u"C. Delete", lambda: self.delete_current()))
        self.canvas.bind(key_codes.EKeySelect,lambda: self.show_current())
        self.imagemenu.append((u"Show", lambda: self.show_current()))
        appuifw.app.body = self.canvas
        self.load_image_metadata()
        self.update_filelist()

    def _update_menu(self):
        """Update left options key to fit current context"""
        if self.current_img < 0:
            sort_menu=(u"Sort images by", (
                (u"time",lambda:self.sort_filelist("gmtime")),
                (u"filesize",lambda:self.sort_filelist("filesize")),
            ))
            appuifw.app.menu = [(u"Update images", self.update_filelist),
                                sort_menu,
                                (u"Search images", self.search_filelist),
                                (u"Close", self.handle_close),
                                ]
        else: # Some image is currently open
            default = [(u"Close", self.handle_close),]
            menu = default + self.imagemenu
            appuifw.app.menu = menu

    def handle_close(self):
        """
        Cancel timer and call parent view's close().
        """
        self.save_image_metadata() # FIXME: this probably is not mandatory here, save after change instead?
        self.active = False
        del(self.canvas) # Delete canvas and activate parent TODO: perhaps not needed?
        self.parent.activate()

    def next_image(self, direction):
        if len(self.IMG_LIST) == 0: 
            appuifw.note(u"No images", 'error')
            self.current_img = -1
            return
        if direction == 0:
            self.current_img = -1
        elif direction < 0:
            if self.current_img <= 0: self.current_img = len(self.IMG_LIST) - 1
            else: self.current_img = self.current_img - 1
        elif direction > 0:
            if self.current_img >= len(self.IMG_LIST) - 1: self.current_img = 0
            else: self.current_img = self.current_img + 1
        self.update()

    def exit_key_handler(self):
        if True or appuifw.query(u"Quit program", 'query') is True:
            self.save_image_metadata()
            self.running = False
            #self.lock.signal()

    def save_image_metadata(self):
        """Image cache saving"""
        #appuifw.note(u"Saving metadata of %d images to %s" % (len(self.IMG_LIST), self.image_metadatafile), 'conf')
        for i in self.IMG_LIST:
            if i.has_key("small"): # Delete image instances from IMG_LIST
                del(i["small"])
        f = open(self.image_metadatafile, "wt")
        f.write(repr(self.IMG_LIST))
        f.close()
        # print "Saved metadata of %d images to %s" % (len(self.IMG_LIST), self.image_metadatafile)

    def load_image_metadata(self):
        """Load cached image metadata from file if found"""
        if os.path.isfile(self.image_metadatafile):
            f = open(self.image_metadatafile, "rt")
            self.IMG_LIST = eval(f.read())
            f.close()
            missing = [] # Save the index of missing images to a list
            for j in range(len(self.IMG_LIST)):
                i = self.IMG_LIST[j]
                if not os.path.isfile(i["path"]):
                    missing.append(j)
                    appuifw.note(u"File %s was missing" % (i["path"]), 'error')
                else:
                    self.IMG_NAMES[i["path"]] = i    
                # TODO: check here also if image exists! Remove from the list if not!
            missing.sort()
            missing.reverse()
            for j in missing:
                self.IMG_LIST.pop(j)
            #print "Read metadata of %d images from %s.\nMissing %d" % (len(self.IMG_LIST), self.image_metadatafile, len(missing))
        else:
            print "Cached metadata %s not found" % (self.image_metadatafile)

    def update(self, dummy=(0, 0, 0, 0)):
        if self.updating is True: return
        self.updating = True
        lheight = 15
        font = (u"Series 60 Sans", 12)
        self.canvas.clear()
        #self.canvas.text((5, 20), u"PyS60 Image gallery", font=(u"Series 60 Sans", 20))
        #self.canvas.text((5, 200), u"Free RAM: %d kB" % (sysinfo.free_ram()/1024), font=font)
        if self.current_img < 0:
            l = 15
            self.canvas.text((5, l), u"%d total images" % (len(self.IMG_NAMES.keys())), font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"%d NEW images" % (len(self.IMG_NEW_LIST)), font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press left/right to view images", font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press 1 to set image caption", font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press 2 to set image tags", font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press 3 to toggle image visibility", font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press up to come back to this screen", font=font, fill=0x000066)
            l = l + lheight
            self.canvas.text((5, l), u"Press 'enter' to view original image", font=font, fill=0x000066)
        elif len(self.IMG_LIST) > 0:
            i = self.IMG_LIST[self.current_img]
            l = 15
            self.canvas.text((80, l), u"File %d/%d" % (self.current_img+1, len(self.IMG_LIST)), font=font, fill=0x000066)
            if i.has_key("filesize"):
                self.canvas.text((5, l), u"Size %.1f kB" % (i["filesize"]/1024), font=font, fill=0x000066)
            l = l + lheight
            if i.has_key("gmtime"):
                filetime = u"" + time.strftime("File time: %Y-%m-%dT%H:%M:%SZ ", time.localtime(i["gmtime"]))
                self.canvas.text((5, l), filetime, font=font, fill=0x000066)
            self.canvas.text((5, 80), u"Loading...", font=font, fill=0x000066)
            # Show metadata
            textline = 175
            lineheight = 15
            margin = 6
            self.canvas.rectangle((margin-1, textline-15, margin+7, textline + lineheight*3+5), fill=0xaaaaaa)
            self.canvas.rectangle((margin+8, textline-15, 300, textline + lineheight*3+5), fill=0xdddddd)
            # Write caption
            if i.has_key("caption"): text = i["caption"]
            else: text = u""
            self.canvas.text((margin, textline), u"1 %s" % (text), font=font, fill=0x000066)
            textline = textline + lineheight
            # Write tags
            if i.has_key("tags"): text = i["tags"]
            else: text = u""
            self.canvas.text((margin, textline), u"2 %s" % (text), font=font, fill=0x000066)
            textline = textline + lineheight
            # Write visibility
            if i.has_key("visibility"): text = i["visibility"]
            else: text = u""
            self.canvas.text((margin, textline), u"3 %s" % (text), font=font, fill=0x000066)
            textline = textline + lineheight
            # Sync text
            if i.has_key("status"): text = i["status"]
            else: text = u"not sync'ed"
            self.canvas.text((margin, textline), u"0 Sync with server (%s)" % text, font=font, fill=0x000066)
            textline = textline + lineheight
            # Show image
            thumbs = self.find_thumbnails(i["path"])
            if i.has_key("small"):
                small = i["small"]
            elif thumbs.has_key("170x128"): # pregenerated thumbnail was found
                small = graphics.Image.open(thumbs["170x128"]["path"])
            else: # generate and save thumbnail
                i["small"] = self.save_thumbnail(i["path"], (170, 128))
                small = i["small"]
                #image = graphics.Image.open(i["path"])
                #small = image.resize((170, 128), keepaspect=1)
                #del(image)
            self.canvas.blit(small, target=(5, 31))
            #del(small)
        else:
            self.canvas.text((5, 80), u"No images", font=font, fill=0x000066)
        self._update_menu()
        self.updating = False
        
    def blit_image(self, canvas, img, data):
        self.canvas.clear()
        self.update()
        self.canvas.blit(img, target=(5, 30))
        self.canvas.text((100, 10), u"%.1f kB" % (data["filesize"]/1024), font=(u"Series 60 Sans", 10), fill=0x333333)
        if data.has_key("caption"):
            canvas.text((5, 100), data["caption"], font=(u"Series 60 Sans", 10), fill=0x000066)
        e32.ao_sleep(0.01) # Wait until the canvas has been drawn

    def store_filenames_cb(self, arg, dirname, names):
        for name in names:
            if self.p_ext.search(name):
                IMG = {}
                IMG["path"] = os.path.join(dirname,name) # Full path
                if self.IMG_NAMES.has_key(IMG["path"]): continue # Already found
                stat = os.stat(IMG["path"])
                IMG["filesize"] = stat[6] # File size in bytes
                IMG["gmtime"] = stat[8] # Modification time
                # Ignore images older than ...
                #if IMG["gmtime"] < self.gmtime-10*24*60*60: continue #print "wanha", IMG["path"], gmtime-IMG["gmtime"]
                #f = open(IMG["path"], "rb")
                #idata = f.read()
                #f.close()
                # Calculate md5sum
                #IMG["md5"] = md5.new(idata).hexdigest() # md5sum
                self.IMG_LIST.append(IMG)
                self.IMG_NEW_LIST.append(IMG)
                self.IMG_NAMES[IMG["path"]] = IMG

    def update_filelist(self):
        for dir in self.directories:
            if os.path.isdir(dir):
                os.path.walk(dir, self.store_filenames_cb, None)

    def _get_thumbnail_path_components(self, imagefilename):
        # Path and filename settings
        basename = os.path.basename(imagefilename)
        dirname = os.path.dirname(imagefilename)
        thumbbasedir = os.path.join(dirname, "_PAlbTN")
        return basename, dirname, thumbbasedir

    def find_thumbnails(self, imagefilename):
        """Find all pregenerated thumbnail files for 'imagefilename'."""
        basename, dirname, thumbbasedir = self._get_thumbnail_path_components(imagefilename)
        thumbnails_available = {}
        if not os.path.isdir(thumbbasedir):
            return thumbnails_available # There was no "_PAlbTN", so there are no thumbnails either
        thumbinstances = os.listdir(thumbbasedir) # Thumbnails are saved into directories like "56x42", "170x120" etc
        for thumb in thumbinstances:
            thumbinstance = os.path.join(thumbbasedir, thumb, basename + "_" + thumb) # E.g. "030820083076.jpg_170x128"
            if os.path.isfile(thumbinstance):
                width, height = thumb.split("x") # e.g. "170x120" -> (170, 120)
                thumbnails_available[thumb] = {"path":thumbinstance, "width":width, "height":height}
        return thumbnails_available
    
    def save_thumbnail(self, imagefilename, size=(170,128)):
        """
        Create resized version of imagefilename and save it into _PAlbTN-thumbnail directory.
        Return generated image instance.
        """
        basename, dirname, thumbbasedir = self._get_thumbnail_path_components(imagefilename)
        try: # TODO: dummy try/except here for now, in the future error logging here
            image = graphics.Image.open(imagefilename)
        except:
            appuifw.note(u"Could not open %s" % (imagefilename), 'error')
            self.delete_current()
            self.current_img = 0
            #self.IMG_LIST.pop(self.current_img)
            return
            #appuifw.note(u"TODO: ask here if user wants to delete it.", 'info')
            #raise
        thumb = "%dx%d" % (size)
        thumbdir = os.path.join(thumbbasedir, thumb)
        if not os.path.isdir(thumbdir):
            os.makedirs(thumbdir)
        thumbinstance = os.path.join(thumbdir, basename + "_" + thumb) # E.g. "030820083076.jpg_170x128"
        small = image.resize(size, keepaspect=1)
        small.save(thumbinstance, format="JPEG", quality=60)
        return small

    def ask_caption(self):
        if self.current_img < 0 or len(self.IMG_LIST) == 0: 
            appuifw.note(u"No image selected", 'error')
            return
        if self.IMG_LIST[self.current_img].has_key("caption"):
            old_caption = self.IMG_LIST[self.current_img]["caption"]
        else: old_caption = u""
        caption = appuifw.query(u"Caption", "text", old_caption)
        if caption is not None:
            self.IMG_LIST[self.current_img]["caption"] = caption

    def ask_tags(self):
        """Test function to select file tags from a selection list."""
        if self.current_img < 0 or len(self.IMG_LIST) == 0: 
            appuifw.note(u"No image selected", 'error')
            return
        # TODO: editable tags
        selected = appuifw.multi_selection_list(self.tags, style="checkbox", search_field=1)
        # appuifw.note(u"Selected %s" % str(selected), 'conf')
        self.IMG_LIST[self.current_img]["tags"] = ','.join([self.tags[i] for i in selected]) # Ah, I love python
        self.update()

    def toggle_visibility(self):
        """Test function to select file tags from a selection list."""
        if self.current_img < 0 or len(self.IMG_LIST) == 0: 
            appuifw.note(u"No image selected", 'error')
            return
        try:
            i = self.visibilities.index(self.IMG_LIST[self.current_img]["visibility"])
        except:
            i = 0
        if i < len(self.visibilities)-1:
            i = i + 1
        else:
            i = 0
        self.IMG_LIST[self.current_img]["visibility"] = self.visibilities[i]
        self.update()

    def sync_server(self):
        """Send image to the server. Initial/test version."""
        if self.current_img >= 0:
            current_img = self.IMG_LIST[self.current_img]
            current_img["status"] = u"synchronizing"
            filename = current_img["path"]
            host = self.Main.config["host"]
            script = self.Main.config["script"]
            headers = {} # set useragent etc
            f=open(filename, 'r')
            filedata = f.read()
            f.close()
            # Create "files"-list which contains all files to send
            files = [("file1", filename, filedata)]
            params = {"caption":current_img["caption"].encode("utf-8"), 
                      "tags":current_img["tags"].encode("utf-8"),
                      "visibility":current_img["visibility"].encode("utf-8"),
                      }
            res = http_poster.post_multipart(host, script, params, files, headers)
            if res[0] == 200:
                current_img["status"] = u"synchronized"
            else:
                current_img["status"] = u"sync failed"
            print res[2][:200]
            #self.update()


    def delete_current(self):
        """Delete current image permanently."""
        if (self.current_img >= 0 and 
           appuifw.query(u'Delete current image %d/%d permanently?' % (self.current_img+1, len(self.IMG_LIST)), 'query') is True):
            os.remove(self.IMG_LIST[self.current_img]["path"])
            self.IMG_LIST.pop(self.current_img)
            self.current_img = self.current_img - 1
            e32.ao_sleep(0.05) # let the query popup disappear before update
            self.update()

    def show_current(self):
        """Call function which shows current original image file"""
        if self.current_img >= 0:
            self.show_file(self.IMG_LIST[self.current_img]["path"])
            self.update()

    def show_file(self, path):
        """
        Show current image with content_handler. 
        Return False if file was not found, otherwise return True.
        """
        if not os.path.isfile(path):
            appuifw.note(u"File %s not found" % (path), 'error')
            return False
        else:
            lock=e32.Ao_lock()
            content_handler = appuifw.Content_handler(lock.signal)
            content_handler.open(path)
            lock.wait()
            return True

    def sort_filelist(self, key):
        appuifw.note(u"Sorry, sorting by %s is not implemented yet" % (key), 'info')

    def search_filelist(self):
        search = appuifw.query(u"Search string", "text", u"")
        p_search = re.compile(search, re.IGNORECASE)
        found = 0
        for i in range(len(self.IMG_LIST)):
            if self.IMG_LIST[i].has_key("caption") and p_search.search(self.IMG_LIST[i]["caption"]):
                found = found + 1
        appuifw.note(u"Sorry, searching is not implemented yet. But %d found anyway!" % (found), 'info')

    # TODO:
    def search_without_caption(self):
        """Return a list of photos without caption"""
        pass
