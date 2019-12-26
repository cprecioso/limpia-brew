# limpia-brew

This command lets you choose the formulae you don't want, and will uninstall it
along any of their dependencies (only those which are not use by other wanted
formulae).

This tool can sometimes cause false positives (overzealous uninstalling), so it
will ask you to confirm the formulae to remove in each step.

# Usage

Just type

    $ npx limpia-brew

There's no need to install anything! The script will guide you along the way.

# Installing

If you use the program often and want to install it, you can do so with `npm`

    $ npm install --global limpia-brew

or with `yarn`:

    $ yarn global add limpia-brew
