# bin-manager
Simple interface for managing harvest bins.


## setup



```
cp example-config.py config.py
pip3 install -r requirements.txt


sudo cp bin-manager.service /etc/systemd/system/
sudo systemctl enable bin-manager.service
sudo systemctl start bin-manager.service

sudo cp rules.v4 /etc/iptables/
```
Don't forget to edit the config file too.


## Misc

[Do this to speed up printing](https://github.com/jimevins/glabels/issues/53)
