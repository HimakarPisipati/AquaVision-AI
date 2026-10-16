# Third-Party Software, Licenses, and Notices

This repository incorporates or links to third-party open-source libraries, pretrained model architectures, and research datasets. Each component is subject to the terms of its own respective license agreement.

---

## 1. Summary of Third-Party Components and Licenses

| Component / Resource | Author / Provider | Project Role | License | Official Source / Notice |
|---|---|---|---|---|
| **Ultralytics YOLOv8** | Ultralytics Inc. | Object Detection Architecture & Training | **AGPL-3.0** / Commercial | [GitHub](https://github.com/ultralytics/ultralytics) / [License](https://github.com/ultralytics/ultralytics/blob/main/LICENSE) |
| **Meta SAM 2.1** | Meta AI Research | Zero-Shot Segmentation Foundation Model | **Apache-2.0** | [GitHub](https://github.com/facebookresearch/sam2) / [License](https://github.com/facebookresearch/sam2/blob/main/LICENSE) |
| **SAM 2.1 Small Weights** | Meta AI Research | Pretrained Neural Checkpoint (`.pt`) | **Apache-2.0** | [Meta Checkpoint Release](https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_small.pt) |
| **FloW Dataset** | Cheng et al. / Roboflow | Training, Validation & Test Dataset | **CC BY 4.0** | [Roboflow Universe](https://universe.roboflow.com/waste-detection-zxduh/flow-9dt9s-ysldg) / [Paper](https://openaccess.thecvf.com/content/ICCV2021/html/Cheng_FloW_A_Dataset_and_Benchmark_for_Floating_Waste_Detection_ICCV_2021_paper.html) |
| **PyTorch** | PyTorch Foundation / Meta | Deep Learning Framework & Tensor Compute | **Modified BSD (3-Clause)** | [PyTorch License](https://github.com/pytorch/pytorch/blob/main/LICENSE) |
| **OpenCV Headless** | OpenCV Team | Computer Vision & Image Processing | **Apache-2.0** | [OpenCV License](https://github.com/opencv/opencv/blob/4.x/LICENSE) |
| **NumPy** | NumPy Developers | Array & Numerical Operations | **BSD 3-Clause** | [NumPy License](https://github.com/numpy/numpy/blob/main/LICENSE.txt) |
| **Pandas** | Pandas Development Team | Tabular Data Analysis & CSV Metrics | **BSD 3-Clause** | [Pandas License](https://github.com/pandas-dev/pandas/blob/main/LICENSE) |
| **Matplotlib** | Matplotlib Team | Plotting & Evaluation Curves | **Matplotlib License (PSF-based)** | [Matplotlib License](https://matplotlib.org/stable/users/project/license.html) |
| **Pillow (PIL)** | Jeffrey A. Clark (Alex) & contributors | Image Manipulation & Overlay Encoding | **HPND (MIT-equivalent)** | [Pillow License](https://github.com/python-pillow/Pillow/blob/main/LICENSE) |
| **PyYAML** | Kirill Simonov | YAML Parser for Dataset Configuration | **MIT** | [PyYAML License](https://github.com/yaml/pyyaml/blob/master/LICENSE) |
| **Hydra Core** | Meta Platforms Inc. | Configuration Management for SAM 2 | **MIT** | [Hydra License](https://github.com/facebookresearch/hydra/blob/main/LICENSE) |
| **iopath** | Meta Platforms Inc. | File I/O Utilities for SAM 2 | **Apache-2.0** | [iopath License](https://github.com/facebookresearch/iopath/blob/main/LICENSE) |
| **FastAPI** | Sebastián Ramírez | Optional Backend REST API Framework | **MIT** | [FastAPI License](https://github.com/fastapi/fastapi/blob/master/LICENSE) |
| **Uvicorn** | Encode OSS | ASGI Server for Backend | **BSD 3-Clause** | [Uvicorn License](https://github.com/encode/uvicorn/blob/master/LICENSE.md) |

---

## 2. Key License Notices and Terms

### A. Ultralytics YOLOv8 (GNU AGPL-3.0)
- **Notice:** Ultralytics YOLOv8 is licensed under the GNU Affero General Public License v3.0.
- **Copyleft Implication:** If you modify, redistribute, or deliver services running YOLOv8 over a computer network, AGPL-3.0 requires making available the complete corresponding source code under the terms of the AGPL-3.0, unless you have obtained an Ultralytics Commercial License.
- **Project Position:** This educational repository provides full, unobstructed access to its source code, Jupyter notebooks, and integration scripts for academic review and portfolio demonstration.

### B. Meta Segment Anything Model 2 (Apache License 2.0)
```text
Copyright (c) Meta Platforms, Inc. and affiliates.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### C. FloW Dataset (Creative Commons Attribution 4.0 International — CC BY 4.0)
- **Attribution Notice:** 
  The FloW dataset used for single-class bottle detection fine-tuning is published under Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Academic Citation:**
  ```bibtex
  @InProceedings{Cheng_2021_ICCV,
      author = {Cheng, Yuwei and Zhu, Jiannan and Jiang, Mengxin and Fu, Jie and Pang, Changsong and Wang, Peidong and Sankaran, Kris and Onabola, Olawale and Liu, Yimin and Liu, Dianbo and Bengio, Yoshua},
      title = {FloW: A Dataset and Benchmark for Floating Waste Detection in Inland Waters},
      booktitle = {Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)},
      month = {October},
      year = {2021},
      pages = {10953-10962}
  }
  ```
- **Roboflow Universe Export:** [flow - v1 new version](https://universe.roboflow.com/waste-detection-zxduh/flow-9dt9s-ysldg/dataset/1)

### D. BSD 3-Clause Notice (NumPy, Pandas, PyTorch, Uvicorn)
```text
Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice, this list
   of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list
   of conditions and the following disclaimer in the documentation and/or other materials
   provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be
   used to endorse or promote products derived from this software without specific prior
   written permission.
```

---

## 3. Separation of Rights and Model Weights

1. **Original Project Code:** The project's original notebooks, integration algorithms, visualization functions, and backend services are written by the author.
2. **Third-Party Pretrained Checkpoints:** Pretrained model weights (`sam2.1_hiera_small.pt`) are proprietary intellectual property of Meta Platforms, Inc. and are distributed by Meta under the Apache-2.0 license.
3. **FloW Dataset:** The training imagery and annotations are copyrighted by their respective authors and made available under CC BY 4.0.
4. **Exclusion from Repository:** Heavy binaries (`*.pt`), bulk dataset archives, and local runtime environments are excluded from Git commits via `.gitignore`. Users download models and data directly from upstream primary sources.
