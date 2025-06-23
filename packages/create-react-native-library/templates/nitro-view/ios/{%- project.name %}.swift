class Hybrid<%- project.name -%> : Hybrid<%- project.name -%>Spec {

  // UIView
  var view: UIView = UIView()

  // props
  var color: String = "#000" {
    didSet {
      view.backgroundColor = hexStringToUIColor(hexColor: color)
    }
  }
  
  func hexStringToUIColor(hexColor: String) -> UIColor {
    let stringScanner = Scanner(string: hexColor)

    if(hexColor.hasPrefix("#")) {
      stringScanner.scanLocation = 1
    }
    var color: UInt32 = 0
    stringScanner.scanHexInt32(&color)

    let r = CGFloat(Int(color >> 16) & 0x000000FF)
    let g = CGFloat(Int(color >> 8) & 0x000000FF)
    let b = CGFloat(Int(color) & 0x000000FF)

    return UIColor(red: r / 255.0, green: g / 255.0, blue: b / 255.0, alpha: 1)
  }  
}
