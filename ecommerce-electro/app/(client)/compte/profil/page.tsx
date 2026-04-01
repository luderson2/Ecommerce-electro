'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, MapPin, Headphones, LogOut, ChevronRight, Edit, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SectionTitle } from '@/components/section-title'
import { StatusBadge } from '@/components/status-badge'
import { useAuth } from '@/contexts/auth-context'


const savedAddresses = [
  {
    id: '1',
    label: 'Maison',
    address: '123 rue Principale, Apt 4B',
    city: 'Montreal',
    province: 'Quebec',
    postalCode: 'H1A 1A1',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Travail',
    address: '456 avenue des Affaires, Bureau 100',
    city: 'Montreal',
    province: 'Quebec',
    postalCode: 'H2B 2B2',
    isDefault: false,
  },
]

const supportTickets = [
  {
    id: 'TKT-001',
    subject: 'Refrigerateur ne refroidit pas correctement',
    status: 'open',
    date: '2024-03-15',
  },
  {
    id: 'TKT-002',
    subject: 'Demande concernant un retard de livraison',
    status: 'resolved',
    date: '2024-02-28',
  },
]


export default function AccountPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  
  
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
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const updateProfile = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  
  if (!user) {
    return null
  }

  const displayName = user.profile?.first_name || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <SectionTitle title="Mon compte" subtitle={`Bon retour, ${displayName}!`} />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Souhaits</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Adresses</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          
          <TabsContent value="profile">
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez a jour les details de votre profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={profile.firstName + ' ' + profile.lastName}
                    onChange={(e) => {
                      const [firstName, lastName] = e.target.value.split(' ')
                      updateProfile('firstName', firstName)
                      updateProfile('lastName', lastName)
                    }}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Courriel</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le courriel ne peut pas etre modifie
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{'Telephone'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    placeholder="+1 (514) 123-4567"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    disabled={isSaving}
                    onClick={() => {
                      setProfile({
                        firstName: user.profile?.first_name || '',
                        lastName: user.profile?.last_name || '',
                        email: user.email || '',
                        phone: user.profile?.phone || '',
                      })
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      'Sauvegarder'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card mt-6">
              <CardHeader>
                <CardTitle>Actions du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Changer le mot de passe
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {'Se deconnecter'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="orders">
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Historique des commandes</CardTitle>
                    <CardDescription>Consultez et suivez vos commandes</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/account/orders">Voir tout</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="wishlist">
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ma liste de souhaits</CardTitle>
                
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/wishlist">Voir la liste complete</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="addresses">
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Adresses sauvegardees</CardTitle>
                    <CardDescription>Gerez vos adresses de livraison</CardDescription>
                  </div>
                  <Button>Ajouter une adresse</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg relative">
                      {address.isDefault && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Par defaut
                        </Badge>
                      )}
                      <p className="font-medium mb-2">{address.label}</p>
                      <p className="text-sm text-muted-foreground">{address.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        {!address.isDefault && (
                          <Button variant="ghost" size="sm">
                            {'Definir par defaut'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

         
          <TabsContent value="support">
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Billets de support</CardTitle>
                    <CardDescription>Consultez votre historique de support</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/support">Nouveau billet</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {supportTickets.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun billet de support</p>
                ) : (
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{ticket.id}</p>
                            <Badge
                              variant={ticket.status === 'open' ? 'default' : 'secondary'}
                            >
                              {ticket.status === 'open' ? 'Ouvert' : 'Resolu'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(ticket.date).toLocaleDateString('fr-CA')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Voir les details
                        </Button>
                      </div>
                    ))}
                  </div>
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
