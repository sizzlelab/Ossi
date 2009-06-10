# $Id: P2PFusion.py 128 2009-01-16 09:09:33Z aapris $

"""
Base classes for different view types.
"""

import appuifw

class View:
    """
    Base class for all views.
    """

    def __init__(self, parent):
        """
        Initialize variables, e.g. references to calling view and main program.
        """
        self.name = "Base.View"
        self.parent = parent
        self.Main = parent.Main

    def activate(self):
        """Set main menu to app.body and left menu entries."""
        appuifw.app.exit_key_handler = self.exit_key_handler

    def exit_key_handler(self):
        """"Call self.close()."""
        self.close()

    def close(self):
        """Activate previous (calling) view."""
        self.parent.activate()

class TabView(View):
    """
    Base class for all tabbed views. Instances of this will have
    one or more tabs.
    
    Simple use case:

    class MyTabbedView(Base.TabView):
        def __init__(self, parent):
            TabView.__init__(self, parent)
            self.name = "MyTabView"
            self.tabs.append((u"Some", SomeTab(self)))
            self.tabs.append((u"Other", OtherTab(self)))
    """

    def __init__(self, parent):
        """
        __init__ must be defined in derived class.
        """
        View.__init__(self, parent)
        self.name = "Base.TabView"
        self.tabs = []
        self.current_tab = 0

    def activate(self):
        """Set main menu to app.body and left menu entries."""
        View.activate(self, parent)
        if len(self.tabs) == 0:
            raise "No tabs are defined " # FIXME: raising strings is deprecated
        # Create tab name list from tabs sequence
        self.tab_menu = [item[0] for item in self.tabs]
        # Put all views to another sequence
        self.views = [item[1] for item in self.tabs]
        appuifw.app.set_tabs(self.tab_menu, self.handle_tab)
        appuifw.app.activate_tab(self.current_tab)
        self.views[self.current_tab].activate()

    def handle_tab(self, index):
        """Call current tab's activate()."""
        self.current_tab = index
        self.views[index].activate()

    def close(self):
        appuifw.app.set_tabs([u"Back to normal"], lambda x: None)
        # Activate previous (calling) view
        self.parent.activate()

