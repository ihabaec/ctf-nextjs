#!/bin/bash
FLAG_FILE="/tmp/.flag_activated"
echo "1" > $FLAG_FILE
sync 
echo "Flag activated! Will deactivate in 2 minutes." 
(
  sleep 120
  echo "0" > $FLAG_FILE
  sync 
  echo "Flag deactivated after timeout." >> /var/log/filter.log
) &

echo "Script completed"