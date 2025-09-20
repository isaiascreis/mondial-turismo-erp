import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Plane, 
  Bed, 
  Car, 
  Save,
  Check,
  FileText,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passengerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  observacoes: z.string().optional(),
});

const serviceSchema = z.object({
  tipo: z.enum(["aereo", "hotel", "transfer", "outros"]),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  localizador: z.string().optional(),
  fornecedorId: z.number().optional(),
  valorVenda: z.string().min(1, "Valor de venda é obrigatório"),
  valorCusto: z.string().min(1, "Valor de custo é obrigatório"),
  detalhes: z.any().optional(),
});

const flightDetailsSchema = z.object({
  numeroVoo: z.string().optional(),
  companhiaAerea: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  dataVoo: z.string().optional(),
  horarioPartida: z.string().optional(),
  horarioChegada: z.string().optional(),
  direcao: z.enum(["ida", "volta", "ida-volta"]).optional(),
  classe: z.string().optional(),
  observacoes: z.string().optional(),
});

const hotelDetailsSchema = z.object({
  nomeHotel: z.string().optional(),
  cidade: z.string().optional(),
  endereco: z.string().optional(),
  dataCheckIn: z.string().optional(),
  dataCheckOut: z.string().optional(),
  regimeAlimentacao: z.enum(["cafe-manha", "meia-pensao", "pensao-completa", "all-inclusive", "sem-refeicao"]).optional(),
  categoriaApartamento: z.string().optional(),
  numeroDiarias: z.string().optional(),
  numeroHospedes: z.string().optional(),
  observacoes: z.string().optional(),
});

const sellerSchema = z.object({
  vendedorId: z.number().min(1, "Vendedor é obrigatório"),
  comissaoPercentual: z.string().min(1, "Comissão é obrigatória"),
});

const paymentPlanSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.string().min(1, "Valor é obrigatório"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  quemRecebe: z.enum(["AGENCIA", "FORNECEDOR"]),
});

type PassengerFormData = z.infer<typeof passengerSchema>;
type ServiceFormData = z.infer<typeof serviceSchema>;
type FlightDetailsFormData = z.infer<typeof flightDetailsSchema>;
type HotelDetailsFormData = z.infer<typeof hotelDetailsSchema>;
type SellerFormData = z.infer<typeof sellerSchema>;
type PaymentPlanFormData = z.infer<typeof paymentPlanSchema>;

interface SaleFormProps {
  sale?: any;
  clients: any[];
  onClose: () => void;
}

export function SaleForm({ sale, clients, onClose }: SaleFormProps) {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [salesSellers, setSalesSellers] = useState<any[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchClient, setSearchClient] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const { data: sellers } = useQuery({
    queryKey: ["/api/sellers"],
  });

  const passengerForm = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: { nome: "", cpf: "", dataNascimento: "", observacoes: "" },
  });

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { 
      tipo: "aereo", 
      descricao: "", 
      localizador: "", 
      valorVenda: "", 
      valorCusto: "" 
    },
  });

  const flightDetailsForm = useForm<FlightDetailsFormData>({
    resolver: zodResolver(flightDetailsSchema),
    defaultValues: {
      numeroVoo: "",
      companhiaAerea: "",
      origem: "",
      destino: "",
      dataVoo: "",
      horarioPartida: "",
      horarioChegada: "",
      direcao: "ida",
      classe: "",
      observacoes: "",
    },
  });

  const hotelDetailsForm = useForm<HotelDetailsFormData>({
    resolver: zodResolver(hotelDetailsSchema),
    defaultValues: {
      nomeHotel: "",
      cidade: "",
      endereco: "",
      dataCheckIn: "",
      dataCheckOut: "",
      regimeAlimentacao: "cafe-manha",
      categoriaApartamento: "",
      numeroDiarias: "",
      numeroHospedes: "",
      observacoes: "",
    },
  });

  const sellerForm = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: { comissaoPercentual: "" },
  });

  const paymentForm = useForm<PaymentPlanFormData>({
    resolver: zodResolver(paymentPlanSchema),
    defaultValues: { 
      descricao: "", 
      valor: "", 
      dataVencimento: "", 
      formaPagamento: "", 
      quemRecebe: "AGENCIA" 
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      toast({ title: "Venda criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você está deslogado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Erro ao criar venda", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/sales/${sale?.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Venda atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você está deslogado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Erro ao atualizar venda", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const confirmSaleMutation = useMutation({
    mutationFn: async (saleId: number) => {
      await apiRequest("PUT", `/api/sales/${saleId}/status`, { status: "venda" });
    },
    onSuccess: () => {
      toast({ title: "Venda confirmada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você está deslogado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Erro ao confirmar venda", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Initialize form data if editing
  useEffect(() => {
    if (sale) {
      setSelectedClient(sale.client);
      setPassengers(sale.passengers || []);
      setServices(sale.services || []);
      setSalesSellers(sale.sellers || []);
      setPaymentPlans(sale.paymentPlans || []);
    }
  }, [sale]);

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchClient.toLowerCase()) ||
    (client.cpf && client.cpf.includes(searchClient))
  );

  const totals = services.reduce(
    (acc, service) => {
      acc.valorTotal += Number(service.valorVenda || 0);
      acc.custoTotal += Number(service.valorCusto || 0);
      return acc;
    },
    { valorTotal: 0, custoTotal: 0 }
  );
  totals.lucro = totals.valorTotal - totals.custoTotal;

  const handleAddPassenger = (data: PassengerFormData) => {
    if (editingItem) {
      setPassengers(passengers.map(p => p.id === editingItem.id ? { ...editingItem, ...data } : p));
    } else {
      setPassengers([...passengers, { ...data, id: Date.now() }]);
    }
    setShowPassengerModal(false);
    setEditingItem(null);
    passengerForm.reset();
  };

  const handleAddService = (data: ServiceFormData) => {
    let serviceData = { ...data };
    
    // Se for serviço aéreo, incluir detalhes do voo
    if (data.tipo === "aereo") {
      const flightDetails = flightDetailsForm.getValues();
      serviceData.detalhes = flightDetails;
    }
    
    // Se for serviço de hotel, incluir detalhes do hotel
    if (data.tipo === "hotel") {
      const hotelDetails = hotelDetailsForm.getValues();
      serviceData.detalhes = hotelDetails;
    }
    
    if (editingItem) {
      setServices(services.map(s => s.id === editingItem.id ? { ...editingItem, ...serviceData } : s));
    } else {
      setServices([...services, { ...serviceData, id: Date.now() }]);
    }
    setShowServiceModal(false);
    setEditingItem(null);
    serviceForm.reset();
    flightDetailsForm.reset();
    hotelDetailsForm.reset();
  };

  const handleAddSeller = (data: SellerFormData) => {
    const seller = sellers?.find(s => s.id === data.vendedorId);
    if (!seller) return;

    const valorComissao = (totals.valorTotal * Number(data.comissaoPercentual)) / 100;
    
    if (editingItem) {
      setSalesSellers(salesSellers.map(s => s.id === editingItem.id ? 
        { ...editingItem, ...data, seller, valorComissao } : s));
    } else {
      setSalesSellers([...salesSellers, { 
        ...data, 
        seller, 
        valorComissao, 
        id: Date.now() 
      }]);
    }
    setShowSellerModal(false);
    setEditingItem(null);
    sellerForm.reset();
  };

  const handleAddPayment = (data: PaymentPlanFormData) => {
    if (editingItem) {
      setPaymentPlans(paymentPlans.map(p => p.id === editingItem.id ? { ...editingItem, ...data } : p));
    } else {
      setPaymentPlans([...paymentPlans, { ...data, id: Date.now() }]);
    }
    setShowPaymentModal(false);
    setEditingItem(null);
    paymentForm.reset();
  };

  const handleSave = () => {
    if (!selectedClient) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }

    // Remove IDs temporários (gerados com Date.now()) antes de enviar para o backend
    const cleanPassengers = passengers.map(({ id, ...passenger }) => passenger);
    const cleanServices = services.map(({ id, ...service }) => service);
    const cleanSellers = salesSellers.map(({ id, ...seller }) => seller);
    const cleanPaymentPlans = paymentPlans.map(({ id, ...payment }) => payment);

    const saleData = {
      clienteId: selectedClient.id,
      passengers: cleanPassengers,
      services: cleanServices,
      sellers: cleanSellers,
      paymentPlans: cleanPaymentPlans,
    };

    if (sale) {
      updateMutation.mutate(saleData);
    } else {
      createMutation.mutate(saleData);
    }
  };

  const handleConfirmSale = () => {
    if (!sale || !sale.id) {
      toast({ 
        title: "Erro", 
        description: "Salve a venda antes de confirmá-la",
        variant: "destructive" 
      });
      return;
    }

    if (sale.status === "venda") {
      toast({ 
        title: "Esta venda já foi confirmada",
        variant: "destructive" 
      });
      return;
    }

    if (!selectedClient) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }

    if (services.length === 0) {
      toast({ 
        title: "Adicione pelo menos um serviço", 
        variant: "destructive" 
      });
      return;
    }

    confirmSaleMutation.mutate(sale.id);
  };

  const getStatusBadge = (status: string = "orcamento") => {
    const statusMap = {
      orcamento: { label: "Orçamento", className: "status-orcamento" },
      venda: { label: "Venda", className: "status-venda" },
      cancelada: { label: "Cancelada", className: "status-cancelada" },
    };
    const statusConfig = statusMap[status as keyof typeof statusMap] || statusMap.orcamento;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const steps = [
    { id: 1, name: "Cliente & Passageiros", description: "Informações básicas" },
    { id: 2, name: "Serviços", description: "Aéreo, Hotel, Transfer" },
    { id: 3, name: "Vendedores", description: "Comissões" },
    { id: 4, name: "Pagamentos", description: "Plano de pagamento" },
  ];

  return (
    <div className="p-8" data-testid="sale-form-container">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-sale-form-title">
              {sale ? "Editar Venda/Orçamento" : "Nova Venda/Orçamento"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Referência: <span className="font-medium" data-testid="text-sale-reference">
                {sale?.referencia || "#2025-0001"}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(sale?.status)}
            <Button variant="secondary" onClick={onClose} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 ${step === stepItem.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === stepItem.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stepItem.id}
                    </div>
                    <span className="text-sm font-medium">{stepItem.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-px bg-border"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Client Selection */}
            {step === 1 && (
              <>
                <Card data-testid="card-client-selection">
                  <CardHeader>
                    <CardTitle>Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Buscar Cliente</label>
                      <div className="relative mt-1">
                        <Input
                          type="text"
                          placeholder="Digite o nome ou CPF do cliente..."
                          value={searchClient}
                          onChange={(e) => setSearchClient(e.target.value)}
                          data-testid="input-search-client"
                        />
                      </div>
                    </div>

                    {/* Client List */}
                    {searchClient && !selectedClient && (
                      <div className="border rounded-md max-h-48 overflow-y-auto">
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setSelectedClient(client);
                              setSearchClient("");
                            }}
                            data-testid={`client-option-${client.id}`}
                          >
                            <p className="font-medium">{client.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.cpf && `CPF: ${client.cpf} • `}
                              {client.email && `Email: ${client.email}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Client */}
                    {selectedClient && (
                      <div className="bg-muted p-4 rounded-md" data-testid="selected-client">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{selectedClient.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedClient.cpf && `CPF: ${selectedClient.cpf} • `}
                              {selectedClient.email && `Email: ${selectedClient.email}`}
                            </p>
                            {selectedClient.telefone && (
                              <p className="text-sm text-muted-foreground">
                                Telefone: {selectedClient.telefone}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(null)}
                            data-testid="button-clear-client"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Passengers */}
                <Card data-testid="card-passengers">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Passageiros</CardTitle>
                      <Button 
                        onClick={() => setShowPassengerModal(true)} 
                        size="sm"
                        data-testid="button-add-passenger"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Passageiro
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {passengers.map((passenger) => (
                        <div
                          key={passenger.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                          data-testid={`passenger-item-${passenger.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{passenger.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {passenger.dataNascimento && `Nascimento: ${passenger.dataNascimento}`}
                                {passenger.cpf && ` • CPF: ${passenger.cpf}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(passenger);
                                passengerForm.reset(passenger);
                                setShowPassengerModal(true);
                              }}
                              data-testid={`button-edit-passenger-${passenger.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPassengers(passengers.filter(p => p.id !== passenger.id))}
                              data-testid={`button-delete-passenger-${passenger.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {passengers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground" data-testid="no-passengers">
                          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p>Nenhum passageiro adicionado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 2: Services */}
            {step === 2 && (
              <Card data-testid="card-services">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Serviços</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          serviceForm.reset({ ...serviceForm.getValues(), tipo: "aereo" });
                          setShowServiceModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-add-aereo"
                      >
                        <Plane className="w-4 h-4 mr-2" />
                        Aéreo
                      </Button>
                      <Button
                        onClick={() => {
                          serviceForm.reset({ ...serviceForm.getValues(), tipo: "hotel" });
                          setShowServiceModal(true);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-add-hotel"
                      >
                        <Bed className="w-4 h-4 mr-2" />
                        Hotel
                      </Button>
                      <Button
                        onClick={() => {
                          serviceForm.reset({ ...serviceForm.getValues(), tipo: "transfer" });
                          setShowServiceModal(true);
                        }}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        data-testid="button-add-transfer"
                      >
                        <Car className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="border border-border rounded-lg p-4"
                        data-testid={`service-item-${service.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              service.tipo === 'aereo' ? 'bg-blue-100 dark:bg-blue-900' :
                              service.tipo === 'hotel' ? 'bg-green-100 dark:bg-green-900' :
                              service.tipo === 'transfer' ? 'bg-purple-100 dark:bg-purple-900' :
                              'bg-gray-100 dark:bg-gray-900'
                            }`}>
                              {service.tipo === 'aereo' && <Plane className="text-blue-600 dark:text-blue-400 w-4 h-4" />}
                              {service.tipo === 'hotel' && <Bed className="text-green-600 dark:text-green-400 w-4 h-4" />}
                              {service.tipo === 'transfer' && <Car className="text-purple-600 dark:text-purple-400 w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {service.tipo.charAt(0).toUpperCase() + service.tipo.slice(1)}
                              </h4>
                              <p className="text-sm text-muted-foreground">{service.descricao}</p>
                              {service.localizador && (
                                <p className="text-sm text-muted-foreground">
                                  Localizador: {service.localizador}
                                </p>
                              )}
                              {service.tipo === 'aereo' && service.detalhes && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {service.detalhes.numeroVoo && (
                                    <p>✈️ Voo: {service.detalhes.numeroVoo}</p>
                                  )}
                                  {service.detalhes.companhiaAerea && (
                                    <p>🏢 Cia: {service.detalhes.companhiaAerea}</p>
                                  )}
                                  {(service.detalhes.origem || service.detalhes.destino) && (
                                    <p>🛫 {service.detalhes.origem} → {service.detalhes.destino}</p>
                                  )}
                                  {service.detalhes.dataVoo && (
                                    <p>📅 {new Date(service.detalhes.dataVoo).toLocaleDateString('pt-BR')}</p>
                                  )}
                                  {service.detalhes.direcao && (
                                    <p>🔄 {service.detalhes.direcao.charAt(0).toUpperCase() + service.detalhes.direcao.slice(1)}</p>
                                  )}
                                </div>
                              )}
                              {service.tipo === 'hotel' && service.detalhes && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {service.detalhes.nomeHotel && (
                                    <p>🏨 Hotel: {service.detalhes.nomeHotel}</p>
                                  )}
                                  {service.detalhes.cidade && (
                                    <p>📍 Cidade: {service.detalhes.cidade}</p>
                                  )}
                                  {(service.detalhes.dataCheckIn || service.detalhes.dataCheckOut) && (
                                    <p>📅 Check-in: {service.detalhes.dataCheckIn && new Date(service.detalhes.dataCheckIn).toLocaleDateString('pt-BR')} → Check-out: {service.detalhes.dataCheckOut && new Date(service.detalhes.dataCheckOut).toLocaleDateString('pt-BR')}</p>
                                  )}
                                  {service.detalhes.regimeAlimentacao && (
                                    <p>🍽️ Regime: {service.detalhes.regimeAlimentacao.replace('-', ' ').replace('_', ' ').charAt(0).toUpperCase() + service.detalhes.regimeAlimentacao.replace('-', ' ').replace('_', ' ').slice(1)}</p>
                                  )}
                                  {service.detalhes.categoriaApartamento && (
                                    <p>🛏️ Categoria: {service.detalhes.categoriaApartamento}</p>
                                  )}
                                  {service.detalhes.numeroDiarias && (
                                    <p>📊 Diárias: {service.detalhes.numeroDiarias}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(service);
                                serviceForm.reset(service);
                                if (service.tipo === 'aereo' && service.detalhes) {
                                  flightDetailsForm.reset(service.detalhes);
                                }
                                if (service.tipo === 'hotel' && service.detalhes) {
                                  hotelDetailsForm.reset(service.detalhes);
                                }
                                setShowServiceModal(true);
                              }}
                              data-testid={`button-edit-service-${service.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setServices(services.filter(s => s.id !== service.id))}
                              data-testid={`button-delete-service-${service.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="financial-positive">
                              Venda: R$ {Number(service.valorVenda).toLocaleString('pt-BR')}
                            </span>
                            <span className="financial-negative">
                              Custo: R$ {Number(service.valorCusto).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground" data-testid="no-services">
                        <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>Nenhum serviço adicionado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Sellers */}
            {step === 3 && (
              <Card data-testid="card-sellers">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Vendedores</CardTitle>
                    <Button 
                      onClick={() => setShowSellerModal(true)} 
                      size="sm"
                      data-testid="button-add-seller"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Vendedor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesSellers.map((saleSeller) => (
                      <div
                        key={saleSeller.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                        data-testid={`seller-item-${saleSeller.id}`}
                      >
                        <div>
                          <p className="font-medium text-foreground">{saleSeller.seller?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Comissão: {saleSeller.comissaoPercentual}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              R$ {Number(saleSeller.valorComissao || 0).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSalesSellers(salesSellers.filter(s => s.id !== saleSeller.id))}
                            data-testid={`button-delete-seller-${saleSeller.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {salesSellers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground" data-testid="no-sellers">
                        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>Nenhum vendedor adicionado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment Plans */}
            {step === 4 && (
              <Card data-testid="card-payment-plans">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Plano de Pagamento</CardTitle>
                    <Button 
                      onClick={() => setShowPaymentModal(true)} 
                      size="sm"
                      data-testid="button-add-payment"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Parcela
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-3 border border-border rounded-md"
                        data-testid={`payment-item-${plan.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{plan.descricao}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(plan);
                                paymentForm.reset(plan);
                                setShowPaymentModal(true);
                              }}
                              data-testid={`button-edit-payment-${plan.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPaymentPlans(paymentPlans.filter(p => p.id !== plan.id))}
                              data-testid={`button-delete-payment-${plan.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{plan.formaPagamento} • {plan.quemRecebe} • R$ {Number(plan.valor).toLocaleString('pt-BR')}</p>
                          <p>Vencimento: {new Date(plan.dataVencimento).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                    {paymentPlans.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground" data-testid="no-payments">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p>Nenhuma parcela adicionada</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card data-testid="card-financial-summary">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="financial-positive font-semibold" data-testid="text-total-value">
                    R$ {totals.valorTotal.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Custo Total</span>
                  <span className="financial-negative font-semibold" data-testid="text-total-cost">
                    R$ {totals.custoTotal.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Lucro</span>
                    <span className="text-emerald-600 font-bold text-lg" data-testid="text-profit">
                      R$ {totals.lucro.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Margem: {totals.valorTotal ? ((totals.lucro / totals.valorTotal) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                {step > 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                    data-testid="button-previous"
                  >
                    Anterior
                  </Button>
                )}
                {step < 4 && (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className="flex-1"
                    data-testid="button-next"
                  >
                    Próximo
                  </Button>
                )}
              </div>
              
              {step === 4 && (
                <>
                  <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-sale"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {sale ? "Atualizar Orçamento" : "Salvar Orçamento"}
                  </Button>
                  <Button
                    onClick={handleConfirmSale}
                    variant="default"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={createMutation.isPending || updateMutation.isPending || confirmSaleMutation.isPending || !sale}
                    data-testid="button-confirm-sale"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {confirmSaleMutation.isPending ? "Confirmando..." : "Confirmar Venda"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Modal */}
      <Dialog open={showPassengerModal} onOpenChange={setShowPassengerModal}>
        <DialogContent data-testid="dialog-passenger">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Passageiro" : "Adicionar Passageiro"}
            </DialogTitle>
          </DialogHeader>
          <Form {...passengerForm}>
            <form onSubmit={passengerForm.handleSubmit(handleAddPassenger)} className="space-y-4">
              <FormField
                control={passengerForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-passenger-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={passengerForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-passenger-cpf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passengerForm.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-passenger-birth" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={passengerForm.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-passenger-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowPassengerModal(false)}
                  data-testid="button-cancel-passenger"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save-passenger">
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="max-w-2xl" data-testid="dialog-service">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Serviço" : "Adicionar Serviço"}
            </DialogTitle>
          </DialogHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(handleAddService)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aereo">Aéreo</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={serviceForm.control}
                  name="localizador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localizador</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-service-localizador" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={serviceForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-service-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="fornecedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supplier">
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={serviceForm.control}
                  name="valorVenda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Venda *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          data-testid="input-service-sale-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={serviceForm.control}
                  name="valorCusto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Custo *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          data-testid="input-service-cost-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Flight Details - Show only for aereo service type */}
              {serviceForm.watch("tipo") === "aereo" && (
                <div className="mt-6 p-4 border border-border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center">
                    ✈️ Detalhes do Voo
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={flightDetailsForm.control}
                      name="numeroVoo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Voo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: AD1234" data-testid="input-flight-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="companhiaAerea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Companhia Aérea</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Azul, LATAM, GOL" data-testid="input-airline" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="origem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origem</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: São Paulo (GRU)" data-testid="input-origin" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="destino"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destino</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Rio de Janeiro (SDU)" data-testid="input-destination" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="dataVoo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Voo</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-flight-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="direcao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direção</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-flight-direction">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ida">Ida</SelectItem>
                              <SelectItem value="volta">Volta</SelectItem>
                              <SelectItem value="ida-volta">Ida e Volta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="horarioPartida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Partida</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-departure-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="horarioChegada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário de Chegada</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-arrival-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="classe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classe</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Econômica, Executiva" data-testid="input-class" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={flightDetailsForm.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Observações do Voo</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Detalhes adicionais sobre o voo..." data-testid="input-flight-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Hotel Details - Show only for hotel service type */}
              {serviceForm.watch("tipo") === "hotel" && (
                <div className="mt-6 p-4 border border-border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center">
                    🏨 Detalhes do Hotel
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={hotelDetailsForm.control}
                      name="nomeHotel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Hotel</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Hotel Copacabana Palace" data-testid="input-hotel-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Rio de Janeiro - RJ" data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Av. Atlântica, 1702, Copacabana" data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="dataCheckIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Check-in</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-checkin-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="dataCheckOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Check-out</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-checkout-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="regimeAlimentacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regime de Alimentação</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-meal-plan">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cafe-manha">Café da Manhã</SelectItem>
                              <SelectItem value="meia-pensao">Meia Pensão</SelectItem>
                              <SelectItem value="pensao-completa">Pensão Completa</SelectItem>
                              <SelectItem value="all-inclusive">All Inclusive</SelectItem>
                              <SelectItem value="sem-refeicao">Sem Refeição</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="categoriaApartamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria do Apartamento</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Standard, Superior, Deluxe" data-testid="input-room-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="numeroDiarias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Diárias</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="Ex: 5" data-testid="input-nights" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="numeroHospedes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Hóspedes</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="Ex: 2" data-testid="input-guests" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hotelDetailsForm.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Observações do Hotel</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Detalhes adicionais sobre a hospedagem..." data-testid="input-hotel-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowServiceModal(false)}
                  data-testid="button-cancel-service"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save-service">
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Seller Modal */}
      <Dialog open={showSellerModal} onOpenChange={setShowSellerModal}>
        <DialogContent data-testid="dialog-seller">
          <DialogHeader>
            <DialogTitle>Adicionar Vendedor</DialogTitle>
          </DialogHeader>
          <Form {...sellerForm}>
            <form onSubmit={sellerForm.handleSubmit(handleAddSeller)} className="space-y-4">
              <FormField
                control={sellerForm.control}
                name="vendedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendedor *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-seller">
                          <SelectValue placeholder="Selecione um vendedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sellers?.map((seller: any) => (
                          <SelectItem key={seller.id} value={seller.id.toString()}>
                            {seller.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sellerForm.control}
                name="comissaoPercentual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão (%) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        data-testid="input-commission" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowSellerModal(false)}
                  data-testid="button-cancel-seller"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save-seller">
                  Adicionar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Plan Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent data-testid="dialog-payment">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Parcela" : "Adicionar Parcela"}
            </DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-payment-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          data-testid="input-payment-value" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="dataVencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-payment-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="PIX, Cartão, etc." data-testid="input-payment-method" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="quemRecebe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem Recebe *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-receiver">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AGENCIA">Agência</SelectItem>
                          <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowPaymentModal(false)}
                  data-testid="button-cancel-payment"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save-payment">
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
