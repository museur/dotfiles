#!/bin/sh

feh --bg-fill /home/gulver/Pictures/Pictures/orange-sky.jpg &
compton --config /home/gulver/.compton.conf -b &
xsetroot -cursor_name left_ptr &
pulseaudio --start &
xset -b &

userresources=/home/gulver/.Xresources
usermodmap=/home/gulver/.Xmodmap
sysresources=/etc/X11/xinit/.Xresources
sysmodmap=/etc/X11/xinit/.Xmodmap

[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources
if [ -f $sysresources ]; then
    xrdb -merge $sysresources
fi
if [ -f $sysmodmap ]; then
    xmodmap $sysmodmap
fi
if [ -f "$userresources" ]; then
    xrdb -merge "$userresources"
fi
if [ -f "$usermodmap" ]; then
    xmodmap "$usermodmap"
fi
numlockx &
setxkbmap tr &
xmodmap -e "keycode 9 = Caps_Lock NoSymbol Caps_Lock" &
xmodmap -e "keycode 66 = Escape NoSymbol Escape" &
xmodmap -e 'clear Lock' -e 'keycode 0x42 = Escape' &
unclutter -grab &
mouse &
xrdb ~/.Xresources &
if [ -d /etc/X11/xinit/xinitrc.d ] ; then
        for f in /etc/X11/xinit/xinitrc.d/?*.sh ; do
                [ -x "$f" ] && . "$f"
        done
        unset f
fi

urxvtd &
sxhkd -e /home/gulver/.config/sxhkd/sxhkdrc &
exec bspwm
#exec google-chrome-stable
