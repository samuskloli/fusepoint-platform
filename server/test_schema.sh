#!/bin/bash
sqlite3 "$PWD/fusepoint.db" < "$PWD/database/chat_schema.sql"