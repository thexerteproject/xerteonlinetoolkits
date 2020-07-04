# Stop Apache doing directory indexing.
Options -Indexes 


# Try and tell Apache not to serve out any files within this directory as PHP - 
# this helps close a potential security flaw - given people can upload almost anything into an LO.

#prevent execution of php code (and other code)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule .*\.(php|php[0-9]|phtml|pl|sh|java|py)$ - [F]
</IfModule>