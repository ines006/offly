import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const Termos = () => {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <Text style={styles.title}>Termos e Condições</Text>
      <Text style={styles.subtitle}>Última atualização a 18/05/2025</Text>
      <View style={styles.divider} />
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={true}>
        <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
        <Text style={styles.sectionText}>
          Ao aceder e utilizar a aplicação Offly, declara que leu, compreendeu e aceita estar vinculado por estes Termos e Condições de Uso. Se não concordar com qualquer parte destes termos, não deve utilizar a aplicação. A utilização contínua da Offly após alterações a estes termos constitui aceitação das mesmas.
        </Text>

        <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
        <Text style={styles.sectionText}>
          A Offly é uma aplicação que promove o bem-estar digital através de desafios personalizados, competições em equipa e monitorização do tempo de ecrã. O serviço inclui:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Sistema de desafios diários e semanais personalizados</Text>
          <Text style={styles.bulletItem}>• Funcionalidade "Shake Me" para validação de desafios através de fotografias</Text>
          <Text style={styles.bulletItem}>• Competições e rankings entre equipas</Text>
          <Text style={styles.bulletItem}>• Monitorização e gestão do tempo de ecrã</Text>
          <Text style={styles.bulletItem}>• Sistema de recompensas e prémios</Text>
        </View>

        <Text style={styles.sectionTitle}>3. Elegibilidade e Registo de Conta</Text>
        <Text style={styles.subTitle}>3.1 Requisitos de Idade</Text>
        <Text style={styles.sectionText}>
          A utilização da Offly está sujeita às leis locais sobre idade mínima para consentimento digital (13 anos). Os utilizadores menores de idade devem obter consentimento dos pais ou responsáveis legais.
        </Text>
        <Text style={styles.subTitle}>3.2 Informações de Registo</Text>
        <Text style={styles.sectionText}>
          Para criar uma conta, deve fornecer informações precisas e completas, incluindo nome, apelido, endereço de e-mail, nome de utilizador e género. É da sua responsabilidade manter estas informações atualizadas.
        </Text>
        <Text style={styles.subTitle}>3.3 Segurança da Conta</Text>
        <Text style={styles.sectionText}>
          Você é responsável por manter a confidencialidade da sua palavra-passe e por todas as atividades que ocorram na sua conta. Deve notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta.
        </Text>

        <Text style={styles.sectionTitle}>4. Regras de Utilização</Text>
        <Text style={styles.subTitle}>4.1 Uso Permitido</Text>
        <Text style={styles.sectionText}>
          A Offly destina-se exclusivamente ao uso pessoal e não comercial para fins de bem-estar digital e desenvolvimento de hábitos saudáveis de utilização de dispositivos eletrónicos.
        </Text>
        <Text style={styles.subTitle}>4.2 Condutas Proibidas</Text>
        <Text style={styles.sectionText}>É expressamente proibido:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Fornecer informações falsas ou enganosas</Text>
          <Text style={styles.bulletItem}>• Submeter fotografias ou conteúdos inadequados, ofensivos ou que violem direitos de terceiros</Text>
          <Text style={styles.bulletItem}>• Manipular ou falsificar dados de tempo de ecrã</Text>
          <Text style={styles.bulletItem}>• Interferir com o funcionamento normal da aplicação</Text>
          <Text style={styles.bulletItem}>• Utilizar a aplicação para fins comerciais não autorizados</Text>
          <Text style={styles.bulletItem}>• Partilhar credenciais de acesso com terceiros</Text>
          <Text style={styles.bulletItem}>• Tentar aceder a áreas restritas da aplicação ou aos dados de outros utilizadores</Text>
        </View>
        <Text style={styles.subTitle}>4.3 Validação de Desafios</Text>
        <Text style={styles.sectionText}>
          A validação dos desafios diários através de fotografias é processada por sistemas de inteligência artificial, incluindo o ChatGPT da OpenAI. Ao submeter fotografias, você declara que:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Possui todos os direitos sobre as imagens submetidas</Text>
          <Text style={styles.bulletItem}>• As fotografias representam genuinamente a realização do desafio</Text>
          <Text style={styles.bulletItem}>• Consente com o processamento das imagens pelos sistemas de validação</Text>
        </View>

        <Text style={styles.sectionTitle}>5. Competições e Rankings</Text>
        <Text style={styles.subTitle}>5.1 Participação em Equipas</Text>
        <Text style={styles.sectionText}>
          A participação em equipas e competições é voluntária. Os rankings são gerados automaticamente com base no progresso coletivo e individual dos participantes.
        </Text>
        <Text style={styles.subTitle}>5.2 Prémios e Recompensas</Text>
        <Text style={styles.sectionText}>
          Os prémios e recompensas estão sujeitos a disponibilidade e podem requerer a partilha de dados com parceiros da Offly, sempre com o seu consentimento prévio.
        </Text>

        <Text style={styles.sectionTitle}>6. Conteúdo e Contribuições do Utilizador</Text>
        <Text style={styles.subTitle}>6.1 Tipos de Conteúdo do Utilizador</Text>
        <Text style={styles.sectionText}>O conteúdo submetido pelos utilizadores inclui:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Fotografias enviadas através da funcionalidade "Shake Me" para validação de desafios</Text>
          <Text style={styles.bulletItem}>• Capturas de ecrã do tempo de utilização de dispositivos</Text>
          <Text style={styles.bulletItem}>• Informações de perfil e preferências pessoais</Text>
          <Text style={styles.bulletItem}>• Qualquer outro conteúdo criado ou partilhado na aplicação</Text>
        </View>
        <Text style={styles.subTitle}>6.2 Responsabilidade pelo Conteúdo</Text>
        <Text style={styles.sectionText}>
          Você é inteiramente responsável por todo o conteúdo que submete, publica ou partilha através da Offly. Declara e garante que:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Possui todos os direitos necessários sobre o conteúdo submetido</Text>
          <Text style={styles.bulletItem}>• O conteúdo não viola direitos de propriedade intelectual de terceiros</Text>
          <Text style={styles.bulletItem}>• O conteúdo é preciso e não é enganoso</Text>
          <Text style={styles.bulletItem}>• O conteúdo não contém material ilegal, difamatório, obsceno ou inadequado</Text>
        </View>
        <Text style={styles.subTitle}>6.3 Licença de Utilização do Conteúdo</Text>
        <Text style={styles.sectionText}>
          Ao submeter conteúdo, você concede à Offly uma licença mundial, não exclusiva, livre de royalties, transferível e sublicenciável para:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Utilizar, reproduzir e processar o conteúdo para fins de validação de desafios</Text>
          <Text style={styles.bulletItem}>• Armazenar e transmitir o conteúdo através dos nossos sistemas</Text>
          <Text style={styles.bulletItem}>• Processar fotografias através de sistemas de inteligência artificial</Text>
          <Text style={styles.bulletItem}>• Utilizar dados agregados e anonimizados para melhoramento do serviço</Text>
        </View>
        <Text style={styles.subTitle}>6.4 Remoção de Conteúdo</Text>
        <Text style={styles.sectionText}>
          Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos ou que consideremos inadequado, sem aviso prévio.
        </Text>

        <Text style={styles.sectionTitle}>7. Propriedade Intelectual</Text>
        <Text style={styles.subTitle}>7.1 Conteúdo da Offly</Text>
        <Text style={styles.sectionText}>
          Todos os direitos de propriedade intelectual sobre a aplicação Offly, incluindo design, código, logótipos, marcas registadas e conteúdos, pertencem à Offly ou aos seus licenciadores.
        </Text>
        <Text style={styles.subTitle}>7.2 Licença de Utilização da Aplicação</Text>
        <Text style={styles.sectionText}>
          Concedemos-lhe uma licença limitada, não exclusiva, não transferível e revogável para utilizar a Offly de acordo com estes termos.
        </Text>

        <Text style={styles.sectionTitle}>8. Serviços e Integrações de Terceiros</Text>
        <Text style={styles.subTitle}>8.1 Serviços de Terceiros Integrados</Text>
        <Text style={styles.sectionText}>A Offly utiliza serviços de terceiros para fornecer funcionalidades específicas:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• OpenAI ChatGPT: Para validação automática de desafios através de análise de imagens</Text>
          <Text style={styles.bulletItem}>• Serviços de armazenamento: Para backup e sincronização de dados</Text>
        </View>
        <Text style={styles.subTitle}>8.2 Políticas de Terceiros</Text>
        <Text style={styles.sectionText}>O uso de serviços de terceiros está sujeito às suas próprias políticas de privacidade e termos de serviço:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Para o ChatGPT da OpenAI: https://openai.com/privacy</Text>
          <Text style={styles.bulletItem}>• Recomendamos que reveja as políticas de privacidade destes serviços</Text>
        </View>
        <Text style={styles.subTitle}>8.3 Limitação de Responsabilidade sobre Terceiros</Text>
        <Text style={styles.sectionText}>
          Não somos responsáveis pelas práticas de privacidade, conteúdo ou funcionamento de serviços de terceiros. A sua interação com estes serviços é por sua conta e risco.
        </Text>
        <Text style={styles.subTitle}>8.4 Links Externos</Text>
        <Text style={styles.sectionText}>
          A Offly pode conter links para websites ou aplicações de terceiros. Estes links são fornecidos apenas para conveniência e não constituem aprovação do conteúdo desses sites.
        </Text>

        <Text style={styles.sectionTitle}>9. Proteção de Dados e Privacidade</Text>
        <Text style={styles.sectionText}>
          O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, que constitui parte integrante destes termos. Recomendamos a leitura cuidadosa da política de privacidade para compreender como os seus dados são recolhidos, utilizados e protegidos.
        </Text>

        <Text style={styles.sectionTitle}>10. Disponibilidade do Serviço</Text>
        <Text style={styles.subTitle}>10.1 Esforços para Manter o Serviço</Text>
        <Text style={styles.sectionText}>
          Embora nos esforcemos para manter a Offly disponível 24 horas por dia, não garantimos disponibilidade ininterrupta. O serviço pode estar temporariamente indisponível devido a manutenção, atualizações ou circunstâncias imprevistas.
        </Text>
        <Text style={styles.subTitle}>10.2 Modificações ao Serviço</Text>
        <Text style={styles.sectionText}>
          Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte da Offly a qualquer momento, com ou sem aviso prévio.
        </Text>

        <Text style={styles.sectionTitle}>11. Limitação de Responsabilidade</Text>
        <Text style={styles.subTitle}>11.1 Utilização por Sua Conta e Risco</Text>
        <Text style={styles.sectionText}>
          A utilização da Offly é por sua conta e risco. A aplicação é fornecida "tal como está", sem garantias de qualquer tipo.
        </Text>
        <Text style={styles.subTitle}>11.2 Limitação de Danos</Text>
        <Text style={styles.sectionText}>
          Em nenhuma circunstância seremos responsáveis por danos diretos, indiretos, incidentais ou consequenciais resultantes da utilização ou incapacidade de utilização da Offly.
        </Text>

        <Text style={styles.sectionTitle}>12. Terminação</Text>
        <Text style={styles.subTitle}>12.1 Terminação pelo Utilizador</Text>
        <Text style={styles.sectionText}>
          Pode terminar a sua conta a qualquer momento através das definições da aplicação ou contactando-nos diretamente.
        </Text>
        <Text style={styles.subTitle}>12.2 Terminação pela Offly</Text>
        <Text style={styles.sectionText}>
          Reservamo-nos o direito de suspender ou terminar a sua conta se violar estes termos ou se a sua conduta for prejudicial a outros utilizadores ou ao serviço.
        </Text>
        <Text style={styles.subTitle}>12.3 Efeitos da Terminação</Text>
        <Text style={styles.sectionText}>
          Após a terminação da conta, todos os dados associados serão eliminados permanentemente no prazo de 30 dias, salvo obrigações legais em contrário.
        </Text>

        <Text style={styles.sectionTitle}>13. Alterações aos Termos</Text>
        <Text style={styles.sectionText}>
          Podemos atualizar estes Termos e Condições periodicamente. As alterações serão comunicadas através da aplicação ou por e-mail. A continuação do uso da Offly após a publicação das alterações constitui aceitação dos novos termos.
        </Text>

        <Text style={styles.sectionTitle}>14. Lei Aplicável e Resolução de Conflitos</Text>
        <Text style={styles.sectionText}>
          Estes termos são regidos pela legislação portuguesa. Qualquer disputa será resolvida preferencialmente através de mediação e, em última instância, pelos tribunais competentes em Portugal.
        </Text>

        <Text style={styles.sectionTitle}>15. Uso Internacional</Text>
        <Text style={styles.sectionText}>
          A Offly é destinada principalmente ao uso em Portugal. Se aceder à aplicação a partir de outras jurisdições, é responsável pelo cumprimento das leis locais aplicáveis. Não garantimos que o conteúdo da aplicação seja apropriado ou esteja disponível para uso fora de Portugal.
        </Text>

        <Text style={styles.sectionTitle}>16. Indemnização</Text>
        <Text style={styles.sectionText}>
          Você concorda em indemnizar, defender e isentar a Offly, seus afiliados, parceiros e colaboradores de quaisquer reclamações, perdas, responsabilidades, despesas, danos e custos (incluindo honorários legais razoáveis) decorrentes do seu uso da aplicação, violação destes Termos ou violação de quaisquer direitos de terceiros.
        </Text>

        <Text style={styles.sectionTitle}>17. Renúncia e Divisibilidade</Text>
        <Text style={styles.sectionText}>
          A falha da Offly em exercer ou fazer cumprir qualquer direito ou disposição destes Termos não constituirá uma renúncia a tal direito ou disposição. Se qualquer disposição destes Termos for considerada inválida ou inexequível, as restantes disposições permanecerão em pleno vigor e efeito.
        </Text>

        <Text style={styles.sectionTitle}>18. Transferência de Direitos</Text>
        <Text style={styles.sectionText}>
          A Offly pode transferir ou ceder estes termos e os seus direitos e obrigações sem o seu consentimento. Você não pode ceder ou transferir os seus direitos ou obrigações sem consentimento prévio por escrito da Offly.
        </Text>

        <Text style={styles.sectionTitle}>19. Contactos</Text>
        <Text style={styles.sectionText}>
          Para questões relacionadas com estes Termos e Condições, contacte-nos através de:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• E-mail: teamoffly3@gmail.com</Text>
        </View>
        <Text style={styles.sectionText}>
          ________________________________________{"\n"}
          Ao utilizar a Offly, você confirma que leu, compreendeu e aceita estes Termos e Condições, bem como a nossa Política de Privacidade.
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.acceptButton} onPress={() => router.push('/components/entrar/registo?aceitouTermos=1')}>
        <Text style={styles.acceptButtonText}>Aceitar e continuar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/components/entrar/registo')}>
        <Text style={styles.backButtonText}>Voltar atrás</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#263A83',
    marginBottom: 2,
    marginTop: 8,
    letterSpacing: -0.5,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 13,
    color: '#7B7B7B',
    marginBottom: 16,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  scrollArea: {
    flex: 1,
    marginBottom: 28,
    paddingRight: 4,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263A83',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#263A83',
    marginTop: 10,
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  bulletList: {
    marginLeft: 16,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
    lineHeight: 22,
  },
  acceptButton: {
    backgroundColor: '#263A83',
    borderRadius: 32,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#263A83',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    alignSelf: 'stretch',
    width: '100%',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#222',
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: 18,
  },
  backButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
});

export default Termos; 