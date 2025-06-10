---
title: Lazy Loading Tips
description: Why load anything on startup if you don't have to?
date: '250207'
---

Why load anything on startup if you don't have to?

#### Conda

Unless you are sitting on a pile of `ZSH` plugins -- your terminal startup is only slowed down by one thing: `conda`.

First find the `>>> conda initialize >>>` block in your `.bashrc`/`.zshrc`. Mine looks like this.

```bash
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
```

Great. Now copy all of the code inside the else branch, and create the following function in your `.rc` file:

```bash
# source: ChatGPT
function conda() {
    unset -f conda
    # <<< start else branch contents >>>
    if [ -f "/opt/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/miniconda3/bin:$PATH"
    fi
    # <<< end else branch contents >>>
    conda "$@"
}
```

Just comment out the old conda initialization code and you should be good to go! Enjoy :)