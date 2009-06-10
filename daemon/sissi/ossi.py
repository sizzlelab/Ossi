import e32, appuifw
  
def quit():
    print "Exit Key Pressed"
    app_lock.signal()
    
 
def open_ossi():
	path = u"e:\\python\\ossi.html"
	c=appuifw.Content_handler()
	c.open(path)
	app_lock = e32.Ao_lock()
	app_lock.wait()
	appuifw.app.exit_key_handler = quit
 
 
def main():
#	confirm = appuifw.query(u"Go?", "query")
	appuifw.app.title= u"first"
	appuifw.app.menu = [(u"Open Ossi", open_ossi)]
 
main()
app_lock = e32.Ao_lock()
app_lock.wait()