import qrcode
import cv2
import numpy as np
import PIL.Image as Image
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask

def MakeQRCode (index):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=60,
        border=1,
    )
    qr.add_data('https://paralandbusinesscardweb.blob.core.windows.net/web/NFTWebAR/'+ str(index)  +'/index.html')
    qr.make(fit=True)

    # img = qr.make_image(back_color = ( 255 , 255 , 255 ), fill_color = ( 0 , 0 , 0 ))
    img = qr.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())

    type(img)  # qrcode.image.pil.PilImage
    img.save("Result/"+ str(index) + ".png")

    cv_img = cv2.imread("Result/"+ str(index) + ".png")
    b_channel, g_channel, r_channel = cv2.split(cv_img)
    alpha_channel = np.ones(b_channel.shape, dtype=b_channel.dtype) * 255
    xs,ys = np.where(np.sum(cv_img,axis=2)>=20*3)
    alpha_channel[xs, ys] = 0
    img_BGRA = cv2.merge((b_channel, g_channel, r_channel, alpha_channel))

    cv2.imwrite("Result/"+ str(index) + ".png", img_BGRA)

for i in range(721):
    MakeQRCode(i + 1)