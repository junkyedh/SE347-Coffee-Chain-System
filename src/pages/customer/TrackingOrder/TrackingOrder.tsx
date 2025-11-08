import React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MainApiRequest } from "@/services/MainApiRequest"
import Breadcrumbs from "@/components/littleComponent/Breadcrumbs/Breadcrumbs"
import "./TrackingOrder.scss"
import { Clock, CheckCircle, Truck, ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/littleComponent/Button/Button"
import LoadingIndicator from "@/components/littleComponent/LoadingIndicator/Loading"

interface RawOrder {
  id: number
  phoneCustomer: string
  serviceType: "TAKE AWAY" | "DINE IN"
  branchId: number
  orderDate: string
  status: string
  totalPrice?: number
  deliveryFee?: number
  discount?: number
  order_details: {
    productId: number
    size: string
    mood?: string
    quantity: number
  }[]
}

interface ProductDetail {
  id: number
  name: string
  image: string
  sizes: { sizeName: string; price: number }[]
}

interface OrderItem {
  productId: number
  name: string
  image: string
  size: string
  mood?: string
  quantity: number
  price: number
}

const statusMap: Record<
  string,
  {
    label: string
    color: string
    icon: React.ComponentType<{ size?: number }>
    description: string
  }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "#f97316",
    icon: Clock,
    description: "Đơn hàng đang chờ được xác nhận từ cửa hàng",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "#3b82f6",
    icon: CheckCircle,
    description: "Đơn hàng đã được xác nhận và đang chuẩn bị",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    color: "#f59e0b",
    icon: Package,
    description: "Đang pha chế và chuẩn bị đồ uống của bạn",
  },
  READY: {
    label: "Sẵn sàng",
    color: "#10b981",
    icon: CheckCircle,
    description: "Đơn hàng đã sẵn sàng để giao hoặc nhận",
  },
  DELIVERING: {
    label: "Đang giao",
    color: "#8b5cf6",
    icon: Truck,
    description: "Đơn hàng đang được giao đến địa chỉ của bạn",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "#059669",
    icon: CheckCircle,
    description: "Đơn hàng đã được giao thành công",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#ef4444",
    icon: Clock,
    description: "Đơn hàng đã bị hủy",
  },
}

export const TrackingOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<RawOrder | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState("")
  const [custAddress, setCustAddress] = useState("")

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        let phoneNumber: string | undefined
        try {
          const prof = await MainApiRequest.get<{ data: { phone: string; name?: string; address?: string } }>(
            "/auth/callback",
          )
          phoneNumber = prof.data.data.phone
          setCustomerName(prof.data.data.name || "")
          setCustAddress(prof.data.data.address || "")
        } catch {
          const history: Array<{ orderId: number; phone: string }> = JSON.parse(
            localStorage.getItem("guest_order_history") || "[]",
          )
          const guestOrder = history.find((o) => String(o.orderId) === String(id))
          if (guestOrder) {
            phoneNumber = guestOrder.phone
            setCustomerName("Khách vãng lai")
            setCustAddress("")
          }
        }

        if (!phoneNumber) {
          setOrder(null)
          setLoading(false)
          return
        }

        const { data: o } = await MainApiRequest.get<RawOrder>(
          `/order/customer/${encodeURIComponent(phoneNumber)}/${id}`,
        )
        setOrder(o)

        const enriched = await Promise.all(
          o.order_details.map(async (d) => {
            const { data: p } = await MainApiRequest.get<ProductDetail>(`/product/${d.productId}`)
            const sz = p.sizes.find((s) => s.sizeName === d.size) || { sizeName: d.size, price: 0 }
            return {
              productId: p.id,
              name: p.name,
              image: p.image,
              size: d.size,
              mood: d.mood,
              quantity: d.quantity,
              price: sz.price,
            } as OrderItem
          }),
        )
        setItems(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [id])

  if (loading) {
    return (
      <div className="tracking-order">
        <div className="container">
          <div className="tracking-order__empty">
            <LoadingIndicator text="Đang tải thông tin đơn hàng..." />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="tracking-order">
        <div className="container">
          <div className="tracking-order__empty">
            <div className="empty-icon">📦</div>
            <h3>Không tìm thấy đơn hàng</h3>
            <p>Đơn hàng #{id} không tồn tại hoặc đã bị xóa</p>
            <button className="primaryBtn" onClick={() => navigate("/")}>
              <ArrowLeft size={16} />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = statusMap[order.status] || {
    label: order.status,
    color: "#6b7280",
    icon: Clock,
    description: "",
  }
  const StatusIcon = statusInfo.icon

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = order.deliveryFee ?? (order.serviceType === "TAKE AWAY" ? 15000 : 0)
  const discount = order.discount || 0
  const total = subtotal + deliveryFee - discount

  const getProgressSteps = () => {
    const steps = [
      { key: "PENDING", label: "Chờ xác nhận" },
      { key: "CONFIRMED", label: "Đã xác nhận" },
      { key: "PREPARING", label: "Đang chuẩn bị" },
      { key: "READY", label: "Sẵn sàng" },
    ]

    if (order.serviceType === "TAKE AWAY") {
      steps.push({ key: "DELIVERING", label: "Đang giao" })
    }

    steps.push({ key: "COMPLETED", label: "Hoàn thành" })

    const currentIndex = steps.findIndex((step) => step.key === order.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex,
    }))
  }

  const progressSteps = getProgressSteps()

  return (
    <>
      <Breadcrumbs
        title="Theo dõi đơn hàng"
        items={[{ label: "Trang chủ", to: "/" }, { label: "Theo dõi đơn hàng" }]}
      />

      <div className="tracking-order">
        <div className="container">
          <div className="tracking-order__header">
            <div className="tracking-order__header-left">
              <Button
                variant="secondary"
                size="sm"
                className="back-button"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>
            </div>
            <div className="tracking-order__header-center">
              <h1>Đơn hàng #{order.id}</h1>
              <p>Đặt lúc {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
            </div>
            <div className="tracking-order__header-right">
              <Button
                variant="primary"
                size="sm"
                className="new-order-button"
                onClick={() => navigate("/menu")}
              >
                Đặt hàng mới
              </Button>
            </div>
          </div>

          <div className="tracking-order__result">
            <div className="tracking-order__order-info">
              <div className="order-header">
                <h2>Trạng thái đơn hàng</h2>
                <div className={`status-badge ${order.status.toLowerCase()}`}>
                  <StatusIcon size={16} />
                  {statusInfo.label}
                </div>
              </div>
              <p className="status-description">{statusInfo.description}</p>

              <div className="order-details">
                <div className="detail-item">
                  <p>
                    <strong>Khách hàng:</strong> <span>{customerName}</span>
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> <span>{order.phoneCustomer}</span>
                  </p>
                </div>
                <div className="detail-item">
                  <p>
                    <strong>Phương thức:</strong>{" "}
                    <span>{order.serviceType === "TAKE AWAY" ? "Giao hàng" : "Tại cửa hàng"}</span>
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong>{" "}
                    <span>
                      {order.serviceType === "DINE IN" ? "Nhận tại cửa hàng" : custAddress || "Địa chỉ giao hàng"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="tracking-order__timeline">
              <h3>Tiến trình đơn hàng</h3>
              <div className="timeline">
                {progressSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`timeline-item ${step.completed ? "completed" : ""} ${step.current ? "active" : ""}`}
                  >
                    <div className="timeline-content">
                      <div className="title">{step.label}</div>
                      {step.current && <div className="time">{new Date(order.orderDate).toLocaleString("vi-VN")}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tracking-order__items">
              <h3>Chi tiết đơn hàng</h3>
              <div className="items-list">
                {items.map((item) => (
                  <div key={item.productId} className="item">
                    <img
                      src={item.image || "/placeholder.svg?height=60&width=60"}
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-info">
                      <div className="name">{item.name}</div>
                      <div className="details">
                        {item.size}
                        {item.mood && `, ${item.mood === "hot" ? "Nóng" : "Lạnh"}`}
                      </div>
                    </div>
                    <div className="item-price">
                      <div className="quantity">x{item.quantity}</div>
                      <div className="price">{(item.price * item.quantity).toLocaleString("vi-VN")}₫</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total">
                <div className="total-breakdown">
                  <div className="total-line">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="total-line">
                    <span>Phí giao hàng:</span>
                    <span>{deliveryFee.toLocaleString("vi-VN")}₫</span>
                  </div>
                  {discount > 0 && (
                    <div className="total-line discount">
                      <span>Giảm giá:</span>
                      <span>-{discount.toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}
                </div>
                <div className="total-amount">
                  Tổng cộng: <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
