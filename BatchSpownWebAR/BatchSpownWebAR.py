from liquid import Template
import shutil
import os


    
# 讀取資源
def LoadAllResource():
    _ModelPath = "./Resource/Model"
    _MindPath = "./Resource/Mind"

    global _ModelList, _MindList 
    _ModelList = os.listdir(_ModelPath)
    _MindList = os.listdir(_MindPath)

    if(len(_ModelList) == len(_MindList)):
        print("[Mind & Model count pass]:" + str(len(_ModelList)))
    else:
        print("Err")

# 創建樣板資料夾
def InitFolder():
    file_path = "./Template/Template_All/Web"

    for i in range(len(_ModelList)):
        
        path = "./ResultWeb/Web/" + _ModelList[i].split('.')[0]
        shutil.copytree(file_path, path)

        modelPath = "./Resource/Model/" + _ModelList[i].split('.')[0]
        shutil.copytree(modelPath, path + "/scoure/Model/" + _ModelList[i].split('.')[0])

        mindPath = "./Resource/Mind/" + _ModelList[i].split('.')[0] + ".mind"
        shutil.copy(mindPath, path + "/scoure/Mind/")
        
# 合成Model Aframe 樣板
def MakerModelHtnl():
    component_Model = open('./Template/Template_Component/Aframe_Model.html', 'r')
    template_component_Model = Template(component_Model.read())
    global _ModelHtnl
    _ModelHtnl = []
    for i in range(len(_ModelList)):
        _ModelHtnl.append(template_component_Model.render(Model = _ModelList[i], Index = _ModelList[i]))

# 合成AR 網頁
def  MakerWebARHtnl() :
    webBG = open('./Template/Template_BG/index.html', 'r')
    template_BG = Template(webBG.read())
    global _WebARHtnl
    _WebARHtnl = []

    for i in range(len(_ModelList)):
        _WebARHtnl.append(template_BG.render(Model= _ModelHtnl[i], Mind = "./scoure/Mind/" + _MindList[i] ))

    print(_WebARHtnl)

if __name__ == "__main__":
    
    LoadAllResource()
    InitFolder()
    MakerModelHtnl()
    MakerWebARHtnl()
   

    for i in range(len(_ModelList)):
        path = "./ResultWeb/Web/" + _ModelList[i]
        f = open(path +"/index.html", "w")
        f.write(_WebARHtnl[i])
        f.close()