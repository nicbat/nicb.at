---
title: Lazy Loading Tips
date: '250207'
---

Why load anything on startup if you don't have to?

#### Conda

Unless you are sitting on a pile of `ZSH` plugins -- your terminal startup is only slowed down by one thing: `conda`.

```bash
# source: ChatGPT
function conda() {
    unset -f conda
    if [ -f "/opt/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/miniconda3/bin:$PATH"
    fi
    conda "$@"
}
```

> Just replace the default `conda` initialization in your `.bashrc/.zshrc` with the above code. Enjoy :)
