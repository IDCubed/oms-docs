Editing remote files in your vm (windows)
      Getting a ssh terminal working 
      First, get ssh'ing in git bash working. (this is probably what you'd need to do with mac/linux)
        open git bash and cd to ~/.ssh/ (shortcut for c:/users/yourname/.ssh/)
        ssh-keygen hap4-openmustardseed-org
        add a passphrase - you'll only have to enter this once per time you start windows.
        Edit c:/users/yourname/.bashrc
          add the following lines:
          alias hap4='ssh -A root@hap4.openmustardseed.org'
          eval $(ssh-agent) 
          ssh-add ~/.ssh/hap4-openmustardseed-org
        Now, when you start git bash and type 'hap4', it should automatically log you into your vm as root.  Woo hoo!

Next, set up SFTP editing with sublimeText
        Install putty, pageant, and puttygen with ftp://ftp.chiark.greenend.org.uk/users/sgtatham/putty-latest/x86/putty-0.63-installer.exe
        open puttygen
        In the top nav menu, go to conversions>import key
        Select hap4-openmustardseed-org and click "open" 
        Type your passphrase
        Change the key comment to something meaningful, like hap4, and click "save private key".
        That will generate hap4-openmustardseed-org.ppk
        Run Pageant
        Locate Pageant in your windows task bar.  Right click it and select "add key".
        Add c:/users/yourname/.ssh/hap4-openmustardseed-org.ppk

Open Sublimetext
        If you don't have the sftp package, add it with package installer.
        Create a local directory to edit in that will mirror your remote directory
        In sublimetext, go to Project>Add folder to project, and add the directory.
        In the sublimetext sidebar, right click on the directory, and select "SFTP > map folder to remote" 
        A sftp-config.json file will appear in the directory and open for you to edit it.  Add these lines:
        "save_before_upload": true,
        "upload_on_save": true,
        "sync_down_on_open": true,
        "sync_same_age": true,
        "confirm_downloads": false,
        "confirm_sync": true,
        "confirm_overwrite_newer": true,
        "host": "hap4.openmustardseed.org",
        "user": "root",
        "remote_path": "/var/www/python/modules/oms-experimental",
        "ssh_key_file": "c:\/Users\/adam\/.ssh\/hap4-openmustardseed-org.ppk",
        Save the file.
        Now, to edit a remote file , right click on the folder and select "SFTP > Browse Remote".  Select a file to edit.  That will open a local copy.  Saving your file locally will automatically upload the changes to the server.  If you close sublimetext and re-open it, SFTP will automatically pull down the latest copy of your remote files.
