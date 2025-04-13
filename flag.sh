#!/bin/bash

FLAG_FILE="/tmp/.flag_activated"

echo "1" > $FLAG_FILE

sleep 120

echo "0" > $FLAG_FILE

echo "Script completed"