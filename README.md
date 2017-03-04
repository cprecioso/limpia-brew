# limpia-brew
This command lets you choose the formulae you don't want, and will uninstall it along any of their dependencies (only those which are not use by other wanted formulae).

This tool can sometimes cause false positives (overzealous uninstalling), so it will ask you to confirm the formulae to remove in each step.

# Installing

    $ npm install --global limpia-brew

Or with yarn:

    $ yarn global add limpia-brew

# Usage
Just:

    $ limpia-brew

The script will guide you.
