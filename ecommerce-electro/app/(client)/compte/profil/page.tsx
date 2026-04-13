'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, MapPin, Headphones, LogOut, ChevronRight, Edit, Loader2, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/contexts/auth-context'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@/lib/supabase/client'
import { formatPrix } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'


export default function AccountPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { wishlistItems } = useCart()
  const supabase = createClient()

  const [isSaving, setIsSaving] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })


  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.profile?.first_name || '',
        lastName: user.profile?.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
      })
      fetchOrders() 
    }
  }, [user])

 
  const fetchOrders = async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?redirect=/compte')
    }
  }, [user, isLoading, router])

  const updateField = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email!, {
        redirectTo: `${window.location.origin}/compte/profil/reset-password`,
      })
      if (error) throw error
      setMessage({ type: 'success', text: 'Lien de réinitialisation envoyé par courriel.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mon compte</h1>
          <p className="text-muted-foreground mt-1">Bon retour, {displayName} !</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profil</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" /> Commandes</TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2"><Heart className="h-4 w-4" /> Souhaits</TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2"><MapPin className="h-4 w-4" /> Adresse</TabsTrigger>
            <TabsTrigger value="support" className="gap-2"><Headphones className="h-4 w-4" /> Support</TabsTrigger>
          </TabsList>

          {/* SECTION PROFIL */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Gérez les détails de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input value={profile.firstName} onChange={(e) => updateField('firstName', e.target.value)} disabled={isSaving} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={profile.lastName} onChange={(e) => updateField('lastName', e.target.value)} disabled={isSaving} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Courriel (Non modifiable)</Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (514) 123-4567" disabled={isSaving} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sauvegarder les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-red-100">
              <CardHeader><CardTitle>Sécurité et accès</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>
                  Envoyer un lien de changement de mot de passe
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Onglet Commandes */}
          <TabsContent value="orders">
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Historique des commandes</CardTitle>
                    <CardDescription>Consultez et suivez vos commandes</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/compte/commandes">Voir tout</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Affichage du loader pendant le chargement */}
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">Aucune commande pour le moment</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link href="/catalogue">Magasiner</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                   
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/compte/commandes/${order.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium font-mono text-sm uppercase">
                              #{order.id.slice(0, 8)}
                            </p>
                            
                            <Badge
                              variant={order.status === 'payee' ? 'default' : 'secondary'}
                              className={order.status === 'payee' ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString('fr-CA')} - {formatPrix(order.total_amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          
                          <div className="hidden sm:flex -space-x-2 mr-4">
                            {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="h-8 w-8 rounded-full border bg-white p-1 overflow-hidden">
                                <img src={item.product_image || '/placeholder.svg'} alt="" className="h-full w-full object-contain" />
                              </div>
                            ))}
                            {order.order_items?.length > 3 && (
                              <div className="h-8 w-8 rounded-full border bg-muted flex items-center justify-center text-[10px] font-bold">
                                +{order.order_items.length - 3}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="wishlist">
            <Card>
              <CardHeader><CardTitle>Ma liste de souhaits</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {wishlistItems.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Votre liste est vide.</p>
                ) : (
                  wishlistItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-xl">
                      <img src={item.product_image!} alt={item.product_name} className="h-16 w-16 object-contain" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-primary">{formatPrix(item.product_price)}</p>
                      </div>
                      <Button size="sm" asChild><Link href={`/catalogue/${item.product_slug}`}>Voir</Link></Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader><CardTitle>Adresse de livraison</CardTitle></CardHeader>
              <CardContent>
                {user.profile?.address ? (
                  <div className="p-4 border-2 border-primary/10 rounded-xl bg-primary/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-primary">Adresse principale</p>
                      <p className="text-sm mt-1">{user.profile.address}</p>
                    </div>
                    <Badge>Par défaut</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-center py-8">Aucune adresse enregistrée.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}